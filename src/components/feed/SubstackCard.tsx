import Link from "next/link";
import Image from "next/image";
import { type FeedItem, isValidImage, formatFeedDate } from "./types";
import { FeedChevron } from "./FeedChevron";

export function SubstackCard({ item }: { item: FeedItem }) {
  return (
    <Link
      href={item.url || "/content"}
      target="_blank"
      rel="noopener noreferrer"
      className="border-b border-r border-border-light bg-[#fffdf7] flex flex-col group overflow-hidden"
    >
      {isValidImage(item.image) && (
        <div className="relative h-[90px] bg-[#f7f5ef]">
          <Image
            src={item.image!}
            alt={item.title || ""}
            fill
            className="object-cover opacity-85 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      <div className="px-3 py-3 flex flex-col gap-2 flex-1">
        <div className="flex items-center gap-1.5">
          <Image
            src="/assets/icons/substack-icon.svg"
            alt="Substack"
            width={12}
            height={12}
            className="opacity-60"
            unoptimized
          />
          <span className="text-[11px] uppercase tracking-[0.08em] font-medium text-[#857e71]">
            Weekly Newsletter
          </span>
        </div>

        {item.title && (
          <h3 className="type-h4 text-[#1a1a1a] group-hover:text-[#FF6719] transition-colors">
            {item.title}
          </h3>
        )}

        <span className="type-mono-sm text-[#857e71]">
          {formatFeedDate(item.createdAt)}
        </span>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between border-t border-[#e8e2d9]">
        <Image
          src="/assets/icons/substack-icon.svg"
          alt="Substack"
          width={16}
          height={16}
          className="opacity-25"
          unoptimized
        />
        <span className="inline-flex items-center gap-2 type-label px-3 py-1 border border-[#1a1a1a] text-[#1a1a1a] bg-[#fffdf7] group-hover:border-[#FF6719] group-hover:bg-[#FF6719] group-hover:text-white transition-all">
          Read
          <FeedChevron />
        </span>
      </div>
    </Link>
  );
}
