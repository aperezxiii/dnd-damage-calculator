import { useState } from "react";

function TabButton({ label, isActive, onClick }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        padding: "0.6rem 1rem",
        borderRadius: "999px",
        border: "none",
        fontWeight: "700",
        fontSize: "0.95rem",
        cursor: "pointer",
        whiteSpace: "nowrap",
        backgroundColor: isActive
          ? "#111827"
          : isHovered
          ? "#e5e7eb"
          : "#f3f4f6",
        color: isActive ? "#ffffff" : "#374151",
        transform: isPressed
          ? "scale(0.98)"
          : isHovered
          ? "translateY(-1px)"
          : "translateY(0)",
        boxShadow: isActive
          ? "0 6px 16px rgba(0,0,0,0.12)"
          : isHovered
          ? "0 8px 18px rgba(0,0,0,0.08)"
          : "none",
        outline: isActive ? "2px solid rgba(17,24,39,0.15)" : "none",
        transition: "all 0.18s ease",
      }}
    >
      {label}
    </button>
  );
}

export default function TabsNav({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "builder", label: "Builder" },
    { key: "results", label: "Results" },
    { key: "history", label: "History" },
    { key: "loadouts", label: "Loadouts" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "0.5rem",
        overflowX: "auto",
      }}
    >
      {tabs.map((tab) => (
        <TabButton
          key={tab.key}
          label={tab.label}
          isActive={activeTab === tab.key}
          onClick={() => setActiveTab(tab.key)}
        />
      ))}
    </div>
  );
}