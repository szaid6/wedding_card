"use client";

import { useState } from "react";

type VenueMapProps = {
  staticSrc: string | null;
  embedSrc: string;
  title: string;
  frameClassName: string;
  surfaceClassName?: string;
  imgClassName: string;
  clipClassName: string;
  mapClassName: string;
  pinClassName?: string;
};

function VenuePin({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 32" aria-hidden fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 8.25 12 20 12 20s12-11.75 12-20C24 5.373 18.627 0 12 0zm0 17.25a5.25 5.25 0 110-10.5 5.25 5.25 0 010 10.5z" />
    </svg>
  );
}

/** Static map preview with iframe fallback when Google returns an error image. */
export function VenueMap({
  staticSrc,
  embedSrc,
  title,
  frameClassName,
  surfaceClassName,
  imgClassName,
  clipClassName,
  mapClassName,
  pinClassName,
}: VenueMapProps) {
  const [staticFailed, setStaticFailed] = useState(false);
  const showStatic = Boolean(staticSrc) && !staticFailed;

  return (
    <div className={frameClassName}>
      <div className={surfaceClassName}>
        {showStatic ? (
          <img
            src={staticSrc!}
            alt={title}
            className={imgClassName}
            loading="lazy"
            decoding="async"
            onError={() => setStaticFailed(true)}
          />
        ) : (
          <>
            <div className={clipClassName}>
              <iframe
                title={title}
                src={embedSrc}
                className={mapClassName}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            {pinClassName ? <VenuePin className={pinClassName} /> : null}
          </>
        )}
      </div>
    </div>
  );
}
