import { useState } from "react";

const VARIANT_STYLES = {
  primary: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    shadow: "rgba(37,99,235,0.22)",
  },
  secondary: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #d1d5db",
    shadow: "rgba(15,23,42,0.08)",
  },
  danger: {
    background: "#ef4444",
    color: "#ffffff",
    border: "none",
    shadow: "rgba(239,68,68,0.22)",
  },
  ghost: {
    background: "#f9fafb",
    color: "#111827",
    border: "1px solid #e5e7eb",
    shadow: "rgba(15,23,42,0.06)",
  },
  dark: {
    background: "#374151",
    color: "#ffffff",
    border: "none",
    shadow: "rgba(0,0,0,0.22)",
  },
};

const SIZE_STYLES = {
  sm: {
    padding: "0.5rem 0.8rem",
    fontSize: "0.85rem",
    borderRadius: "8px",
    fontWeight: "700",
  },
  md: {
    padding: "0.65rem 0.95rem",
    fontSize: "0.92rem",
    borderRadius: "10px",
    fontWeight: "700",
  },
  lg: {
    padding: "0.8rem 1rem",
    fontSize: "0.95rem",
    borderRadius: "10px",
    fontWeight: "700",
  },
  xl: {
    padding: "1rem 1.25rem",
    fontSize: "1.1rem",
    borderRadius: "14px",
    fontWeight: "800",
  },
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = SIZE_STYLES[size] || SIZE_STYLES.md;

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : "auto",
        background: variantStyle.background,
        color: variantStyle.color,
        border: variantStyle.border,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease, background-color 0.2s ease",
        transform: disabled
          ? "translateY(0)"
          : isPressed
          ? "scale(0.98)"
          : isHovered
          ? "translateY(-1px)"
          : "translateY(0)",
        boxShadow: disabled
          ? "none"
          : isHovered
          ? `0 8px 18px ${variantStyle.shadow}`
          : `0 2px 8px ${variantStyle.shadow}`,
        opacity: disabled ? 0.5 : isHovered ? 0.98 : 1,
        ...sizeStyle,
        ...style,
      }}
    >
      {children}
    </button>
  );
}