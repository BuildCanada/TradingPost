interface OGPreviewProps {
  title: string;
  description: string;
  image?: string;
  url: string;
}

export function OGPreview({ title, description, image, url }: OGPreviewProps) {
  let domain = "buildcanada.ca";
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = "buildcanada.ca";
  }

  return (
    <div className="border border-border-light overflow-hidden">
      {image && (
        <div className="aspect-video overflow-hidden bg-border-light">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-3 space-y-1">
        <p className="type-caption font-medium line-clamp-2">{title}</p>
        <p className="type-label-sm text-text-secondary line-clamp-2">
          {description}
        </p>
        <p className="type-label-sm text-text-muted">{domain}</p>
      </div>
    </div>
  );
}
