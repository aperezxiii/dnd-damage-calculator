import * as React from "react";

export function Switch({ checked, onCheckedChange }) {
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
        style={{
          width: "40px",
          height: "20px",
          backgroundColor: checked ? "#2563eb" : "#d1d5db",
          borderRadius: "999px",
          position: "relative",
          transition: "background-color 0.2s ease",
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
            transition: "left 0.2s ease",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </span>
    </label>
  );
}