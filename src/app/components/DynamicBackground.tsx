interface DynamicBackgroundProps {
  variant?: "landing" | "page" | "dashboard";
}

export function DynamicBackground({ variant = "page" }: DynamicBackgroundProps) {
  const gradients: Record<string, string> = {
    landing:
      "radial-gradient(ellipse at 20% 0%, rgba(108,60,224,0.12) 0%, transparent 50%), " +
      "radial-gradient(ellipse at 80% 20%, rgba(236,72,153,0.08) 0%, transparent 45%), " +
      "radial-gradient(ellipse at 50% 80%, rgba(168,85,247,0.06) 0%, transparent 50%), " +
      "linear-gradient(180deg, #fafafe 0%, #f5f3ff 100%)",
    page:
      "radial-gradient(ellipse at 30% 0%, rgba(108,60,224,0.08) 0%, transparent 50%), " +
      "radial-gradient(ellipse at 80% 60%, rgba(168,85,247,0.05) 0%, transparent 45%), " +
      "linear-gradient(180deg, #fafafe 0%, #f8f7ff 100%)",
    dashboard:
      "radial-gradient(ellipse at 15% 0%, rgba(108,60,224,0.06) 0%, transparent 50%), " +
      "radial-gradient(ellipse at 85% 100%, rgba(168,85,247,0.04) 0%, transparent 50%), " +
      "linear-gradient(180deg, #fafafe 0%, #f9f8ff 100%)",
  };

  return (
    <div
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 0, background: gradients[variant] }}
    />
  );
}
