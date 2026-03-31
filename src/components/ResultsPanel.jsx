import { useState } from "react";

function BreakdownButton({ isExpanded, onClick }) {
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
        backgroundColor: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease",
        transform: isPressed ? "scale(0.98)" : isHovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: isHovered ? "0 6px 14px rgba(0,0,0,0.08)" : "none",
        backgroundColor: isHovered ? "#f9fafb" : "#ffffff",
      }}
    >
      {isExpanded ? "Hide Breakdown" : "Show Breakdown"}
    </button>
  );
}

export default function ResultsPanel({
  results,
  actions,
  expandedBreakdowns,
  toggleBreakdown,
  calculateFinalDamage,
  getPreAdjustmentDamage,
  getColorByType,
  liveGrandTotal,
  groupedDamageTotals,
}) {
  if (results.length === 0) return null;

  const formatModifier = (modifier) => {
    if (modifier === 0) return "";
    return ` ${modifier > 0 ? "+" : "-"} ${Math.abs(modifier)}`;
  };

  const getCritModeLabel = (critType) => {
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
  };

  const getCritSummary = (result, critType) => {
    const modifierText = formatModifier(result.modifier ?? 0);

    switch (critType) {
      case "max":
        return `${result.diceTotal} roll + ${result.maxDice} max${modifierText}`;
      case "reroll":
        return `${result.diceTotal} roll + ${result.critRoll?.total ?? 0} crit roll${modifierText}`;
      case "double":
        return `${result.diceTotal} roll × 2${modifierText}`;
      case "none":
      default:
        return `${result.diceTotal} roll${modifierText}`;
    }
  };

  const sortedGroupedTotals = Object.entries(groupedDamageTotals || {}).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Results
        </h2>
        <p
          style={{
            margin: "0.35rem 0 0 0",
            fontSize: "0.95rem",
            color: "#6b7280",
          }}
        >
          Review totals, damage types, and detailed roll breakdowns.
        </p>
      </div>

      <div
        style={{
          marginBottom: "1.75rem",
          padding: "1.25rem",
          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          color: "white",
          borderRadius: "16px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.10)",
        }}
      >
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: "600",
            opacity: 0.9,
            marginBottom: "0.35rem",
            letterSpacing: "0.02em",
          }}
        >
          GRAND TOTAL DAMAGE
        </div>
        <div
          style={{
            fontSize: "2.25rem",
            fontWeight: "800",
            lineHeight: 1.1,
          }}
        >
          {liveGrandTotal}
        </div>
      </div>

      {sortedGroupedTotals.length > 0 && (
        <div
          style={{
            marginBottom: "1.75rem",
            padding: "1.25rem",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
          }}
        >
          <h3
            style={{
              margin: "0 0 1rem 0",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "#111827",
            }}
          >
            Damage by Type
          </h3>

          <div style={{ display: "grid", gap: "0.65rem" }}>
            {sortedGroupedTotals.map(([type, total]) => (
              <div
                key={type}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 0.9rem",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #f3f4f6",
                  borderRadius: "10px",
                }}
              >
                <span
                  style={{
                    color: getColorByType(type),
                    fontWeight: "700",
                  }}
                >
                  {type}
                </span>
                <span
                  style={{
                    color: "#111827",
                    fontWeight: "700",
                    fontSize: "1rem",
                  }}
                >
                  {total}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem" }}>
        {results.map((group, actionIndex) => {
          const action = actions[actionIndex];
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
                padding: "1.25rem",
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
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.15rem",
                      fontWeight: "700",
                      color: "#111827",
                    }}
                  >
                    Attack Action {actionIndex + 1}
                  </h3>
                  <div
                    style={{
                      marginTop: "0.35rem",
                      color: "#6b7280",
                      fontSize: "0.95rem",
                    }}
                  >
                    Crit Mode: <strong style={{ color: "#111827" }}>{getCritModeLabel(action.critType)}</strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: "0.65rem 0.9rem",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "10px",
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "700",
                      color: "#6b7280",
                      letterSpacing: "0.03em",
                    }}
                  >
                    ACTION TOTAL
                  </div>
                  <div
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: "800",
                      color: "#111827",
                      marginTop: "0.15rem",
                    }}
                  >
                    {actionTotal}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.85rem" }}>
                {group.map((result, partIndex) => {
                  const key = `${actionIndex}-${partIndex}`;
                  const isExpanded = expandedBreakdowns.has(key);
                  const part = action.parts[partIndex];
                  if (!part) return null;

                  const finalDamage = calculateFinalDamage(
                    result,
                    action.critType,
                    part.vulnerable,
                    part.resistant
                  );

                  const preAdjustmentDamage = getPreAdjustmentDamage(result, action.critType);

                  return (
                    <div
                      key={partIndex}
                      style={{
                        padding: "0.9rem 1rem",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #f3f4f6",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: "1 1 420px" }}>
                          <div
                            style={{
                              fontSize: "0.88rem",
                              fontWeight: "700",
                              color: "#374151",
                              marginBottom: "0.35rem",
                            }}
                          >
                            {part.name?.trim() || `Unlabeled Damage ${partIndex + 1}`}
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              flexWrap: "wrap",
                              marginBottom: "0.35rem",
                            }}
                          >
                            <strong
                              style={{
                                color: getColorByType(result.type),
                                fontSize: "1rem",
                              }}
                            >
                              {result.type}
                            </strong>
                            <span
                              style={{
                                fontSize: "1.15rem",
                                fontWeight: "800",
                                color: "#111827",
                              }}
                            >
                              {finalDamage}
                            </span>
                          </div>

                          <div
                            style={{
                              color: "#6b7280",
                              fontSize: "0.92rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {getCritSummary(result, action.critType)}
                          </div>
                        </div>

                        <BreakdownButton
                          isExpanded={isExpanded}
                          onClick={() => toggleBreakdown(actionIndex, partIndex)}
                        />
                      </div>

                      {isExpanded && (
                        <div
                          style={{
                            marginTop: "0.85rem",
                            padding: "0.85rem",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "10px",
                            color: "#4b5563",
                            fontSize: "0.92rem",
                            lineHeight: 1.6,
                            animation: "fadeIn 0.18s ease",
                          }}
                        >
                          <div>
                            ▸ Base Roll: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.baseRolled.join(", ")}]
                            {formatModifier(result.modifier ?? 0)}
                          </div>

                          {action.critType === "max" && (
                            <div>▸ Crit Bonus (Max Dice): {result.maxDice}</div>
                          )}

                          {action.critType === "reroll" && (
                            <div>
                              ▸ Crit Roll: {result.breakdown.count}d{result.breakdown.sides} = [{result.breakdown.critRolled.join(", ")}]
                            </div>
                          )}

                          {action.critType === "double" && (
                            <div>▸ Doubled Dice Total: {result.diceTotal} × 2 = {result.diceTotal * 2}</div>
                          )}

                          <div>▸ Pre-Adjustment Damage: {preAdjustmentDamage}</div>
                          <div>▸ Vulnerable: {part.vulnerable ? "Yes" : "No"}</div>
                          <div>▸ Resistant: {part.resistant ? "Yes" : "No"}</div>
                          <div style={{ marginTop: "0.35rem", fontWeight: "700", color: "#111827" }}>
                            ▸ Final Damage: {finalDamage}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}