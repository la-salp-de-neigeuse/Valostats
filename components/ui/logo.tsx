import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
  href?: string;
  showText?: boolean;
  textClassName?: string;
}

export function Logo({ className = "", size = 28, href, showText = true, textClassName = "" }: LogoProps) {
  const img = (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <Image
        src="/logo.png"
        alt="ValoStats"
        fill
        sizes={`${size}px`}
        className="object-contain logo-image"
        priority
        unoptimized
      />
    </div>
  );

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {img}
      {showText && (
        <span className={`font-bold tracking-wider text-text-primary ${textClassName || "text-lg"}`}>
          VALO<span className="text-accent">STATS</span>
        </span>
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="flex items-center">{content}</Link>;
  }

  return content;
}
