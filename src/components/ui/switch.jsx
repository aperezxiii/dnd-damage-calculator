import * as React from "react";

export function Switch({ checked, onCheckedChange }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        style={{ display: "none" }}
      />
      <span
        style={{
          width: "40px",
          height: "20px",
          backgroundColor: checked ? "#dc2626" : "#ccc",
          borderRadius: "20px",
          position: "relative",
          transition: "background-color 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: checked ? "22px" : "2px",
            top: "2px",
            width: "16px",
            height: "16px",
            backgroundColor: "#fff",
            borderRadius: "50%",
            transition: "left 0.2s",
          }}
        />
      </span>
    </label>
  );
}
