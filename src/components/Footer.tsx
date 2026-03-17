import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[var(--color-dark)] h-14 flex items-center justify-between px-5">
      <Link
        href="/"
        className="type-label text-[var(--color-text-muted)]"
      >
        Build Canada
      </Link>
      <div className="flex gap-4">
        <Link href="#" className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-bg)] transition-colors">
          About
        </Link>
        <Link href="/memos" className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-bg)] transition-colors">
          Memos
        </Link>
        <Link href="/feed" className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-bg)] transition-colors">
          Feed
        </Link>
        <Link href="#" className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-bg)] transition-colors">
          Projects
        </Link>
        <Link href="#" className="type-label text-[var(--color-text-muted)] hover:text-[var(--color-bg)] transition-colors">
          Contact
        </Link>
      </div>
      <div className="flex gap-1.5">
        <span className="w-6 h-6 rounded bg-[var(--color-dark)] border border-[var(--color-text-muted)]/30 flex items-center justify-center type-label-sm text-[var(--color-text-muted)]">
          𝕏
        </span>
        <span className="w-6 h-6 rounded bg-[var(--color-dark)] border border-[var(--color-text-muted)]/30 flex items-center justify-center type-label-sm text-[var(--color-text-muted)]">
          TK
        </span>
        <span className="w-6 h-6 rounded bg-[var(--color-dark)] border border-[var(--color-text-muted)]/30 flex items-center justify-center type-label-sm text-[var(--color-text-muted)]">
          IG
        </span>
        <span className="w-6 h-6 rounded bg-[var(--color-dark)] border border-[var(--color-text-muted)]/30 flex items-center justify-center type-label-sm text-[var(--color-text-muted)]">
          SS
        </span>
      </div>
    </footer>
  );
}
