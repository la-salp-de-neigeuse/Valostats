import type { ReactNode } from "react";

const SIZES = {
  xs: "w-5 h-5 text-[8px]",
  sm: "w-6 h-6 text-[9px]",
  md: "w-8 h-8 text-[10px]",
  lg: "w-10 h-10 text-xs",
  xl: "w-12 h-12 text-sm",
  "2xl": "w-14 h-14 text-base",
  "3xl": "w-16 h-16 text-lg",
  "4xl": "w-20 h-20 text-xl",
  "5xl": "w-24 h-24 text-2xl",
};

type AvatarSize = keyof typeof SIZES;

interface PlaceholderAvatarProps {
  size?: AvatarSize;
  className?: string;
  icon?: ReactNode;
}

function DefaultIcon({ size }: { size: AvatarSize }) {
  const dim = size === "xs" || size === "sm" ? 10 : size === "md" ? 12 : size === "lg" ? 14 : size === "xl" ? 16 : 18;
  return (
    <svg width={dim} height={dim} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 22 2 22 12 2" />
    </svg>
  );
}

export function PlaceholderAvatar({ size = "md", className = "", icon }: PlaceholderAvatarProps) {
  return (
    <div
      className={`rounded-full bg-gradient-brand-br flex items-center justify-center text-white font-bold shrink-0 shadow-glow ${SIZES[size]} ${className}`}
      aria-hidden="true"
    >
      {icon || <DefaultIcon size={size} />}
    </div>
  );
}

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: AvatarSize;
  className?: string;
  icon?: ReactNode;
}

export function UserAvatar({ src, name, size = "md", className = "", icon }: UserAvatarProps) {
  if (src) {
    return (
      <div
        className={`rounded-full bg-surface-hover shrink-0 flex items-center justify-center overflow-hidden ${SIZES[size]} ${className}`}
        title={name || undefined}
      >
        <img src={src} alt={name || ""} className="w-full h-full object-cover" />
      </div>
    );
  }

  return <PlaceholderAvatar size={size} className={className} icon={icon} />;
}
