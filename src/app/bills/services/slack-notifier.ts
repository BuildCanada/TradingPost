import type { BillAnalysis } from "@/app/bills/services/billApi";
import { env } from "@/app/bills/env";

/**
 * Posts a freshly generated bill analysis to Slack (#builder-mp) via an
 * incoming webhook. The webhook URL is pinned to the channel when it is
 * created in Slack, so no channel is specified here.
 *
 * Fire-and-forget: never throws, so a Slack outage can't break bill
 * processing. No-op when BILLS_SLACK_WEBHOOK_URL is unset.
 */

const JUDGMENT_DISPLAY: Record<
  BillAnalysis["final_judgment"],
  { emoji: string; label: string }
> = {
  yes: { emoji: "✅", label: "Vote Yes" },
  no: { emoji: "❌", label: "Vote No" },
  abstain: { emoji: "⚪", label: "Abstain" },
};

const ALIGNMENT_EMOJI: Record<string, string> = {
  aligns: "✅",
  conflicts: "❌",
  neutral: "➖",
};

// Slack section blocks cap mrkdwn text at 3000 chars.
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1)}…`;
}

// The analysis summary is standard markdown; Slack uses mrkdwn.
function toSlackMrkdwn(markdown: string): string {
  return markdown
    .replace(/\*\*(.+?)\*\*/g, "*$1*")
    .replace(/^[-*] /gm, "• ");
}

export async function notifyNewBillAnalysis(params: {
  billId: string;
  title: string;
  shortTitle?: string;
  analysis: BillAnalysis;
}): Promise<void> {
  const webhookUrl = env.BILLS_SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const { billId, title, shortTitle, analysis } = params;

  try {
    const judgment =
      JUDGMENT_DISPLAY[analysis.final_judgment] ?? JUDGMENT_DISPLAY.abstain;
    const displayTitle = shortTitle || analysis.short_title || title;
    const billUrl = env.NEXT_PUBLIC_APP_URL
      ? `${env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")}/bills/${billId}`
      : undefined;

    const tenetLines = (analysis.tenet_evaluations ?? []).map((tenet) => {
      const emoji = ALIGNMENT_EMOJI[tenet.alignment] ?? "➖";
      const explanation = tenet.explanation
        ? ` — ${truncate(tenet.explanation, 200)}`
        : "";
      return `${emoji} *${tenet.title}*${explanation}`;
    });

    const blocks: unknown[] = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: truncate(`New analysis: ${billId} — ${displayTitle}`, 150),
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Overall vote:* ${judgment.emoji} ${judgment.label}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: truncate(
            `*Summary*\n${toSlackMrkdwn(analysis.summary || "_No summary available._")}`,
            3000,
          ),
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: truncate(`*Tenet evaluations*\n${tenetLines.join("\n")}`, 3000),
        },
      },
    ];

    if (billUrl) {
      blocks.push({
        type: "context",
        elements: [{ type: "mrkdwn", text: `<${billUrl}|View full analysis>` }],
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Fallback text for notifications and clients that don't render blocks.
        text: `New analysis: ${billId} — ${displayTitle} (${judgment.label})`,
        blocks,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "<unable to read body>");
      console.error("Slack notification failed:", {
        billId,
        status: response.status,
        body: body.slice(0, 500),
      });
    }
  } catch (error) {
    console.error("Error sending Slack notification:", { billId, error });
  }
}
