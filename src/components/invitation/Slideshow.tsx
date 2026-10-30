"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

const INTERVAL = 4500;

export function Slideshow({ images }: { images: string[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    if (paused || images.length < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % images.length), INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, images.length]);

  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  return (
    <div
      className="relative h-svh w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="relative size-full overflow-hidden bg-emerald">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <Image
              src={images[index]}
              alt=""
              fill
              sizes="500px"
              className="object-cover"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-16 z-10 flex justify-center gap-1.5">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={t.showPhoto(i + 1)}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
