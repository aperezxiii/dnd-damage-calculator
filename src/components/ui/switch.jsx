import * as React from "react";

export function Switch({ checked, onCheckedChange }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        style={{ display: "none" }}
      />
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "42px",
          height: "22px",
          backgroundColor: checked ? "#2563eb" : "#d1d5db",
          borderRadius: "999px",
          position: "relative",
          transition: "background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease",
          boxShadow: checked
            ? "0 0 0 3px rgba(37,99,235,0.12)"
            : "inset 0 1px 2px rgba(0,0,0,0.08)",
          transform: isHovered ? "scale(1.03)" : "scale(1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: checked ? "22px" : "2px",
            top: "2px",
            width: "18px",
            height: "18px",
            backgroundColor: "#fff",
            borderRadius: "50%",
            transition: "left 0.2s ease, box-shadow 0.2s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.22)",
          }}
        />
      </span>
    </label>
  );
}