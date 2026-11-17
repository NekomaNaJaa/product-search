import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  label?: string;
  className?: string;
}

export default function LoadingState({
  label = "กำลังโหลด...",
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-3 text-gray-600",
        className,
      )}
    >
      <LoaderCircle
        aria-hidden="true"
        className="size-8 animate-spin motion-reduce:animate-none"
      />
      <span className="text-sm">{label}</span>
    </div>
  );
}
