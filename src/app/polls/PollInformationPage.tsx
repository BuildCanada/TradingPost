import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { ComponentProps } from "react";

export default function PollInformationPage({ title, children }: { title: string; children: string }) {
  return (
    <div className="mx-[10px] my-[10px] border border-border-light bg-bg">
      <article className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/polls" className="type-label text-text-secondary underline hover:text-dark">Back to polls</Link>
        <h1 className="type-title mt-6 mb-8">{title}</h1>
        <div className="type-body text-text-secondary leading-relaxed space-y-6">
          <ReactMarkdown components={{
            h2: ({ children }: ComponentProps<"h2">) => <h2 className="type-h3 text-dark pt-4">{children}</h2>,
            a: ({ href, children }: ComponentProps<"a">) => <Link href={href ?? "#"} className="underline hover:text-dark">{children}</Link>,
            ul: ({ children }: ComponentProps<"ul">) => <ul className="list-disc pl-6 space-y-3">{children}</ul>,
          }}>{children}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
