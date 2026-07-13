import { UserAvatar } from "@/components/ui/placeholder-avatar";

interface AvatarProps {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  className?: string;
  src?: string | null;
}

export function Avatar({ name, size = "md", className = "", src }: AvatarProps) {
  return <UserAvatar src={src} name={name} size={size} className={className} />;
}
