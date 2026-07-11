import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-ink-100 text-ink-700",
        variant === "success" && "bg-emerald-100 text-emerald-700",
        variant === "warning" && "bg-amber-100 text-amber-700",
        variant === "danger" && "bg-red-100 text-red-700",
        variant === "info" && "bg-sky-100 text-sky-700",
        className
      )}
    >
      {children}
    </span>
  );
}

export function getOrderStatusVariant(
  status: string
): "default" | "success" | "warning" | "danger" | "info" {
  if (status === "paid" || status === "delivered") return "success";
  if (status === "pending_payment") return "warning";
  if (status === "cancelled" || status === "refunded") return "danger";
  if (status === "accepted" || status === "in_production" || status === "shipped")
    return "info";
  return "default";
}
