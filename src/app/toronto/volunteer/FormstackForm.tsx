"use client";

import { useEffect, useRef, useState } from "react";

const FORMSTACK_ORIGIN = "https://cjpac.formstack.com";

/**
 * Embeds one of CJPAC's Formstack forms and adjusts it to fit our page.
 *
 * Formstack's embed code is a script that document.write()s the form in place.
 * That only works while the HTML is still being parsed, so it can't run from a
 * React effect (and would wipe the page if it did). Instead we load it with
 * document.write captured, then insert what it wrote ourselves, running its
 * scripts in order. The form itself runs untouched; only where it lands moves.
 *
 * Formstack renders the form with React. Hiding fields with a stylesheet
 * keyed on their data-testid survives its re-renders, where setting
 * style.display on a node would not. Values are written through the native
 * setter plus an input event, which is what Formstack's controlled inputs
 * listen for; assigning `.value` directly would be overwritten on the next
 * render.
 */
export function FormstackForm({
  slug,
  fill = {},
  check = [],
  hide = [],
}: {
  /** the form's Formstack slug, e.g. "buildthevote_step1" */
  slug: string;
  /** text and hidden fields to fill, by Formstack field ID */
  fill?: Record<string, string>;
  /** checkbox fields to tick, by Formstack field ID */
  check?: string[];
  /** fields to hide, by Formstack field ID */
  hide?: string[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  // The props are fixed per page, so an effect keyed on their contents runs
  // once per mount, not on every render that passes a fresh object.
  const fillKey = JSON.stringify(fill);
  const checkKey = check.join(",");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let cancelled = false;
    let observer: MutationObserver | undefined;

    captureWrites(`${FORMSTACK_ORIGIN}/forms/js.php/${slug}`)
      .then(async (html) => {
        if (cancelled) return;
        await insertHtml(container, html);
        if (cancelled) return;
        observer = applyWhenRendered(
          container,
          JSON.parse(fillKey) as Record<string, string>,
          checkKey ? checkKey.split(",") : [],
        );
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      observer?.disconnect();
      container.replaceChildren();
    };
  }, [slug, fillKey, checkKey]);

  const hidden = hide
    .map((id) => `[data-testid="field-${id}"],[data-testid^="field-${id}-"]`)
    .join(",");

  return (
    <div className="formstack-embed">
      {hidden && <style>{`${hidden}{display:none!important}`}</style>}
      {status === "loading" && (
        <p className="type-label text-text-secondary py-10">Loading the form…</p>
      )}
      {status === "failed" && (
        <p className="font-serif text-[1.05rem] leading-[1.5] py-6">
          The form didn&rsquo;t load.{" "}
          <a
            href={`${FORMSTACK_ORIGIN}/forms/${slug}`}
            className="underline hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open it in a new tab
          </a>
          .
        </p>
      )}
      <div ref={containerRef} />
      <noscript>
        <a href={`${FORMSTACK_ORIGIN}/forms/${slug}`} className="underline">
          Open the form
        </a>
      </noscript>
    </div>
  );
}

/** Runs a document.write()-based embed script and returns what it wrote. */
function captureWrites(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: string[] = [];
    const { write, writeln } = document;
    document.write = (...text: string[]) => {
      chunks.push(text.join(""));
    };
    document.writeln = (...text: string[]) => {
      chunks.push(text.join("") + "\n");
    };
    const restore = () => {
      document.write = write;
      document.writeln = writeln;
      script.remove();
    };

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      restore();
      resolve(chunks.join(""));
    };
    script.onerror = () => {
      restore();
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
}

/** Shared across mounts so navigating back to a form doesn't execute
 *  Formstack's renderer bundle a second time. */
const loadedScripts = new Map<string, Promise<void>>();

/**
 * Inserts HTML that contains scripts, running them in document order the way
 * the parser would have. Scripts inserted via innerHTML never execute, so each
 * one is recreated; an external script has to finish loading before the
 * inline script after it (which calls into it) runs.
 */
async function insertHtml(container: HTMLElement, html: string) {
  const template = document.createElement("template");
  template.innerHTML = html;

  for (const node of Array.from(template.content.childNodes)) {
    if (!(node instanceof HTMLScriptElement)) {
      container.appendChild(node);
      continue;
    }

    if (node.src) {
      const src = node.src;
      let loaded = loadedScripts.get(src);
      if (!loaded) {
        loaded = new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve();
          script.onerror = () => {
            loadedScripts.delete(src);
            reject(new Error(`Failed to load ${src}`));
          };
          document.head.appendChild(script);
        });
        loadedScripts.set(src, loaded);
      }
      await loaded;
    } else {
      const script = document.createElement("script");
      script.textContent = node.textContent;
      container.appendChild(script);
    }
  }
}

/**
 * Fills and ticks fields as Formstack renders them. Its render is async, so
 * the inputs may not exist yet when the scripts finish; we watch for each one
 * rather than assuming it's there. Gives up after 20 seconds.
 */
function applyWhenRendered(
  container: HTMLElement,
  fill: Record<string, string>,
  check: string[],
): MutationObserver | undefined {
  const pendingFill = new Map(Object.entries(fill).filter(([, v]) => v));
  const pendingCheck = new Set(check);

  const apply = () => {
    for (const [id, value] of pendingFill) {
      const input = container.querySelector<HTMLInputElement>(
        `[name="field${id}"]`,
      );
      if (!input) continue;
      if (input.value !== value) setNativeValue(input, value);
      pendingFill.delete(id);
    }
    for (const id of pendingCheck) {
      const box = container.querySelector<HTMLInputElement>(
        `input[type="checkbox"][name="field${id}[]"]`,
      );
      if (!box) continue;
      // A click, not `checked = true`, so Formstack's own handler records it.
      if (!box.checked) box.click();
      pendingCheck.delete(id);
    }
    return pendingFill.size === 0 && pendingCheck.size === 0;
  };

  if (apply()) return undefined;

  const observer = new MutationObserver(() => {
    if (apply()) observer.disconnect();
  });
  observer.observe(container, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 20_000);
  return observer;
}

function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}
