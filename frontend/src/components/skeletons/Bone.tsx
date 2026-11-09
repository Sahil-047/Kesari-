type BoneProps = {
  className?: string;
  /** Soft rounded pill vs hard rect */
  rounded?: "none" | "sm" | "md" | "full";
};

const radius = {
  none: "",
  sm: "rounded-sm",
  md: "rounded-md",
  full: "rounded-full",
} as const;

/** Single shimmer block used by page skeletons. */
export default function Bone({ className = "", rounded = "sm" }: BoneProps) {
  return (
    <div
      aria-hidden
      className={`skel-bone ${radius[rounded]} ${className}`}
    />
  );
}
