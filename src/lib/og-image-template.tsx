import { readFile } from "node:fs/promises";
import { join } from "node:path";

const theme = {
  background: "#1a1a1a",
  accent: "#932f2f",
  accentAlpha20: "rgba(147, 47, 47, 0.20)",
  accentAlpha40: "rgba(147, 47, 47, 0.40)",
  foreground: "#ffffff",
  foreground80: "rgba(255, 255, 255, 0.80)",
  foreground50: "rgba(255, 255, 255, 0.50)",
  foreground30: "rgba(255, 255, 255, 0.30)",
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
        padding: "100px 120px",
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

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "3px", textTransform: "uppercase", color: theme.foreground }}>
            BUILD CANADA
          </span>
          {label && (
            <>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: theme.accent }} />
              <span style={{ fontSize: "28px", textTransform: "uppercase", letterSpacing: "4px", color: theme.accentAlpha40 }}>
                {label}
              </span>
            </>
          )}
        </div>
      </div>

      <div style={{ width: "120px", height: "4px", backgroundColor: theme.accent, marginBottom: "60px" }} />

      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <h1
          style={{
            fontSize: "80px",
            lineHeight: 1.1,
            fontWeight: 700,
            color: theme.foreground,
            margin: 0,
            maxWidth: "1900px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            style={{
              fontSize: "36px",
              color: theme.foreground80,
              maxWidth: "1600px",
              lineHeight: 1.4,
              marginTop: "40px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </p>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "60px" }}>
        {badge && (
          <span style={{ fontSize: "32px", color: theme.accent, fontWeight: 600 }}>
            {badge}
          </span>
        )}
        <span style={{ fontSize: "28px", color: theme.foreground30, marginLeft: "auto" }}>
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
