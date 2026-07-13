"use client";

import { WATERMARK_URL, WATERMARK_LABEL, WATERMARK_DOMAIN } from "@/lib/overlay/watermark-url";

export function Watermark() {
  return (
    <a
      href={WATERMARK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="ol-watermark"
    >
      <span className="ol-watermark-label">{WATERMARK_LABEL}</span>
      <span className="ol-watermark-domain">{WATERMARK_DOMAIN}</span>
    </a>
  );
}
