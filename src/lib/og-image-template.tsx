import { readFile } from "node:fs/promises";
import { join } from "node:path";

const theme = {
  background: "#f6ece3",
  backgroundAlt: "#fbf6f1",
  accent: "#932f2f",
  accentSoft: "rgba(147, 47, 47, 0.20)",
  foreground: "#272727",
  foregroundMuted: "#5d5d5d",
  foregroundFaint: "#888888",
  border: "rgba(39, 39, 39, 0.18)",
} as const;

const sans = "system-ui, -apple-system, sans-serif";

export interface OGImageData {
  title: string;
  description?: string;
  badge?: string;
  label?: string;
}

export function BuildCanadaOGImage({ title, description, badge, label }: OGImageData) {
  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.background,
        color: theme.foreground,
        padding: "72px 96px",
        position: "relative",
        fontFamily: sans,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "10px",
          backgroundColor: theme.accent,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          marginBottom: "36px",
        }}
      >
        <span
          style={{
            fontSize: "30px",
            fontWeight: 800,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: theme.foreground,
          }}
        >
          BUILD CANADA
        </span>
        {label && (
          <>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: theme.accent,
              }}
            />
            <span
              style={{
                fontSize: "24px",
                textTransform: "uppercase",
                letterSpacing: "4px",
                color: theme.accent,
              }}
            >
              {label}
            </span>
          </>
        )}
      </div>

      <div
        style={{
          width: "96px",
          height: "3px",
          backgroundColor: theme.accent,
          marginBottom: "36px",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            lineHeight: 1.1,
            fontWeight: 700,
            color: theme.foreground,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: "28px",
              color: theme.foregroundMuted,
              lineHeight: 1.4,
              marginTop: "24px",
              marginBottom: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "32px",
          borderTop: `1px solid ${theme.border}`,
        }}
      >
        {badge ? (
          <span style={{ fontSize: "24px", color: theme.accent, fontWeight: 600 }}>
            {badge}
          </span>
        ) : (
          <span style={{ fontSize: "24px", color: theme.foregroundFaint }}>
            Canada&apos;s Voice for Builders
          </span>
        )}
        <span style={{ fontSize: "22px", color: theme.foregroundFaint }}>
          buildcanada.com
        </span>
      </div>
    </div>
  );
}

export async function loadLogoAsDataUri(): Promise<string> {
  try {
    const logoPath = join(process.cwd(), "public/assets/logos/Logo Single Line.svg");
    const data = await readFile(logoPath, "base64");
    return `data:image/svg+xml;base64,${data}`;
  } catch {
    return "";
  }
}
