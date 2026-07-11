import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "primary", size = "md", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-brand-500 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600",
          variant === "secondary" &&
            "bg-accent-500 text-white hover:bg-accent-600",
          variant === "outline" &&
            "border-2 border-brand-300 text-brand-700 hover:bg-brand-50",
          variant === "ghost" && "text-brand-700 hover:bg-brand-50",
          variant === "danger" && "bg-red-500 text-white hover:bg-red-600",
          size === "sm" && "h-9 px-4 text-sm",
          size === "md" && "h-11 px-6 text-sm",
          size === "lg" && "h-13 px-8 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
