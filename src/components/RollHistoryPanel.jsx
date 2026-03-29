import { useState } from "react";

function HistoryToggleButton({ isExpanded, onClick }) {
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
        fontSize: "0.85rem",
        fontWeight: "600",
        padding: "0.5rem 0.75rem",
        borderRadius: "8px",
        border: "1px solid #d1d5db",        
        color: "#111827",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease",
        transform: isPressed ? "scale(0.98)" : isHovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: isHovered ? "0 6px 14px rgba(0,0,0,0.08)" : "none",
        backgroundColor: isHovered ? "#f9fafb" : "#ffffff",
      }}
    >
      {isExpanded ? "Hide Snapshot" : "View Snapshot"}
    </button>
  );
}

function ClearHistoryButton({ onClick }) {
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
        fontSize: "0.85rem",
        fontWeight: "700",
        padding: "0.55rem 0.8rem",
        borderRadius: "8px",
        border: "1px solid #fecaca",
        backgroundColor: "#f9fafb",
        color: "#ef4444",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        transform: isPressed ? "scale(0.98)" : isHovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: isHovered ? "0 6px 14px rgba(0,0,0,0.08)" : "none",
        opacity: isHovered ? 0.96 : 1,
      }}
    >
      Clear History
    </button>
  );
}

function getCritModeLabel(critType) {
  switch (critType) {
    case "max":
      return "Max + Roll";
    case "reroll":
      return "Roll + Roll";
    case "double":
      return "Double Roll";
    case "none":
    default:
      return "Off";
  }
}

function SnapshotTag({ label, value, tone = "neutral" }) {
  const toneStyles = {
    neutral: {
      backgroundColor: "#f9fafb",
      border: "1px solid #e5e7eb",
      color: "#374151",
    },
    success: {
      backgroundColor: "#ecfdf5",
      border: "1px solid #a7f3d0",
      color: "#065f46",
    },
    danger: {
      backgroundColor: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#991b1b",
    },
  };

  const styles = toneStyles[tone] || toneStyles.neutral;

  return (
    <div
      style={{
        padding: "0.25rem 0.5rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: "700",
        ...styles,
      }}
    >
      {label}: {value}
    </div>
  );
}

export default function RollHistoryPanel({
  rollHistory,
  expandedHistory,
  toggleHistoryItem,
  calculateFinalDamage,
  getColorByType,
  clearHistory,
}) {
  if (rollHistory.length === 0) return null;

  return (
    <div style={{ marginTop: "2rem" }}>
      <div
        style={{
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Roll History
          </h2>
          <p
            style={{
              margin: "0.35rem 0 0 0",
              fontSize: "0.95rem",
              color: "#6b7280",
            }}
          >
            Previous rolls are stored as snapshots and won’t change when current settings are edited.
          </p>
        </div>

        <ClearHistoryButton onClick={clearHistory} />
      </div>

      <div style={{ display: "grid", gap: "0.9rem" }}>
        {rollHistory.map((entry) => {
          const isExpanded = expandedHistory.has(entry.id);
          const groupedTotals = Object.entries(entry.groupedDamageTotals).sort(
            (a, b) => b[1] - a[1]
          );

          return (
            <div
              key={entry.id}
              style={{
                padding: "1rem 1.1rem",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 420px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      flexWrap: "wrap",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <strong
                      style={{
                        fontSize: "0.95rem",
                        color: "#6b7280",
                      }}
                    >
                      Roll #{entry.rollNumber}
                    </strong>

                    <span
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: "800",
                        color: "#15803d",
                      }}
                    >
                      Total: {entry.grandTotal}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#6b7280",
                      fontSize: "0.92rem",
                      lineHeight: 1.45,
                    }}
                  >
                    {new Date(entry.rolledAt).toLocaleString()} • {entry.actionsSnapshot.length} action
                    {entry.actionsSnapshot.length !== 1 ? "s" : ""} • {groupedTotals.length} damage type
                    {groupedTotals.length !== 1 ? "s" : ""}
                  </div>
                </div>

                <HistoryToggleButton
                  isExpanded={isExpanded}
                  onClick={() => toggleHistoryItem(entry.id)}
                />
              </div>

              {isExpanded && (
                <div
                  style={{
                    marginTop: "0.9rem",
                    paddingTop: "0.9rem",
                    borderTop: "1px solid #f1f5f9",
                    animation: "fadeIn 0.18s ease",
                  }}
                >
                  {groupedTotals.length > 0 && (
                    <div style={{ marginBottom: "0.9rem" }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          color: "#6b7280",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          marginBottom: "0.5rem",
                        }}
                      >
                        Damage by Type
                      </div>

                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {groupedTotals.map(([type, total]) => (
                          <div
                            key={type}
                            style={{
                              padding: "0.45rem 0.7rem",
                              borderRadius: "999px",
                              backgroundColor: "#f9fafb",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.9rem",
                              fontWeight: "700",
                              color: getColorByType(type),
                            }}
                          >
                            {type}: {total}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "grid", gap: "0.65rem" }}>
                    {entry.resultsSnapshot.map((group, actionIndex) => {
                      const action = entry.actionsSnapshot[actionIndex];
                      if (!action) return null;

                      const actionTotal = group.reduce((sum, result, partIndex) => {
                        const part = action.parts[partIndex];
                        if (!part) return sum;

                        return sum + calculateFinalDamage(
                          result,
                          action.critType,
                          part.vulnerable,
                          part.resistant
                        );
                      }, 0);

                      return (
                        <div
                          key={actionIndex}
                          style={{
                            padding: "0.85rem 0.95rem",
                            backgroundColor: "#f9fafb",
                            border: "1px solid #f3f4f6",
                            borderRadius: "12px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "0.75rem",
                              flexWrap: "wrap",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div>
                              <strong style={{ color: "#111827", display: "block" }}>
                                Attack Action {actionIndex + 1}
                              </strong>
                              <span
                                style={{
                                  fontSize: "0.88rem",
                                  color: "#6b7280",
                                }}
                              >
                                Crit Mode:{" "}
                                <strong style={{ color: "#111827" }}>
                                  {getCritModeLabel(action.critType)}
                                </strong>
                              </span>
                            </div>

                            <span
                              style={{
                                fontWeight: "800",
                                color: "#111827",
                              }}
                            >
                              {actionTotal}
                            </span>
                          </div>

                          <div style={{ display: "grid", gap: "0.55rem" }}>
                            {group.map((result, partIndex) => {
                              const part = action.parts[partIndex];
                              if (!part) return null;

                              const finalDamage = calculateFinalDamage(
                                result,
                                action.critType,
                                part.vulnerable,
                                part.resistant
                              );

                              return (
                                <div
                                  key={partIndex}
                                  style={{
                                    padding: "0.7rem 0.8rem",
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "10px",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      gap: "0.75rem",
                                      flexWrap: "wrap",
                                      marginBottom: "0.5rem",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "0.92rem",
                                        color: "#4b5563",
                                      }}
                                    >
                                      {part.name?.trim() || `Damage Part ${partIndex + 1}`}{" "}
                                      <span
                                        style={{
                                          color: getColorByType(result.type),
                                          fontWeight: "700",
                                        }}
                                      >
                                        ({result.type})
                                      </span>
                                    </div>

                                    <strong style={{ color: "#111827" }}>
                                      {finalDamage}
                                    </strong>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      gap: "0.45rem",
                                      flexWrap: "wrap",
                                    }}
                                  >
                                    <SnapshotTag
                                      label="Crit Mode"
                                      value={getCritModeLabel(action.critType)}
                                      tone="neutral"
                                    />
                                    <SnapshotTag
                                      label="Vulnerable"
                                      value={part.vulnerable ? "Yes" : "No"}
                                      tone={part.vulnerable ? "success" : "neutral"}
                                    />
                                    <SnapshotTag
                                      label="Resistant"
                                      value={part.resistant ? "Yes" : "No"}
                                      tone={part.resistant ? "danger" : "neutral"}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}