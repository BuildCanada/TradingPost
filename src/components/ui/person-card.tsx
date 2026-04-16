import Image from "next/image";

interface PersonCardProps {
  name: string;
  title: string | null;
  photo: string | null;
  xUrl?: string | null;
  linkedinUrl?: string | null;
}

function MaplePlaceholder() {
  return (
    <div className="w-full aspect-square bg-border-light/30 border border-border-light flex items-center justify-center">
      <div
        className="w-[40%] h-[40%] opacity-20"
        style={{
          backgroundColor: "currentColor",
          maskImage: "url(/assets/icons/newmapleleaf.svg)",
          maskSize: "contain",
          maskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskImage: "url(/assets/icons/newmapleleaf.svg)",
          WebkitMaskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
        }}
      />
    </div>
  );
}

export function PersonCard({ name, title, photo, xUrl, linkedinUrl }: PersonCardProps) {
  const hasLinks = xUrl || linkedinUrl;

  return (
    <div className="flex flex-col">
      {photo ? (
        <div className="w-full aspect-square overflow-hidden border border-border-light">
          <Image
            src={photo}
            alt={name}
            width={220}
            height={220}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <MaplePlaceholder />
      )}
      <p className="type-h4 leading-tight mt-3">{name}</p>
      {title && (
        <p className="type-body-sm text-text-secondary mt-0.5">{title}</p>
      )}
      {hasLinks && (
        <div className="flex items-center gap-0.5 mt-2">
          {xUrl && (
            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <Image
                src="/assets/icons/platform-x-twitter.svg"
                alt="X"
                width={12}
                height={12}
                className="brightness-0 opacity-50"
              />
            </a>
          )}
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="opacity-50">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
