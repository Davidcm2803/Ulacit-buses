export default function Button({
  children,
  variant = "primary",
  block = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    outline: "border border-border bg-background text-foreground hover:bg-muted",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${block ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
