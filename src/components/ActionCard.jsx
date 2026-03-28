import { useState } from "react";
import DamagePartEditor from "./DamagePartEditor";

function ActionButton({
  children,
  onClick,
  backgroundColor,
  shadowColor = "rgba(0,0,0,0.12)",
}) {
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
        backgroundColor,
        color: "white",
        border: "none",
        padding: "0.65rem 1rem",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        transform: isPressed ? "scale(0.98)" : isHovered ? "translateY(-1px)" : "translateY(0)",
        boxShadow: isHovered ? `0 8px 18px ${shadowColor}` : "none",
        opacity: isHovered ? 0.96 : 1,
      }}
    >
      {children}
    </button>
  );
}

export default function ActionCard({
  action,
  actionIndex,
  actionsLength,
  handleCritTypeChange,
  addPart,
  removeAction,
  handlePartChange,
  validateAndSetNumber,
  removePart,
  damageTypes,
  diceTypes,
}) {
  const [cardHovered, setCardHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => setCardHovered(false)}
      style={{
        marginBottom: "1.25rem",
        padding: "1.25rem",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "14px",
        boxShadow: cardHovered
          ? "0 10px 24px rgba(0,0,0,0.07)"
          : "0 4px 14px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        transform: cardHovered ? "translateY(-1px)" : "translateY(0)",
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
          <p
            style={{
              margin: "0.35rem 0 0 0",
              fontSize: "0.92rem",
              color: "#6b7280",
            }}
          >
            Configure crit behavior and damage parts for this attack.
          </p>
        </div>

        <div
          style={{
            minWidth: "220px",
            padding: "0.85rem 1rem",
            backgroundColor: "#f9fafb",
            border: "1px solid #f3f4f6",
            borderRadius: "12px",
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "700",
                color: "#6b7280",
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              Crit Mode
            </span>
            <select
              value={action.critType}
              onChange={(e) => handleCritTypeChange(actionIndex, e.target.value)}
              style={{
                width: "100%",
                padding: "0.65rem 0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "#ffffff",
                fontSize: "0.95rem",
                color: "#111827",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
            >
              <option value="none">Off</option>
              <option value="max">Max + Roll</option>
              <option value="reroll">Roll + Roll</option>
              <option value="double">Double Roll</option>
            </select>
          </label>
        </div>
      </div>

      <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1rem" }}>
        {action.parts.map((part, partIndex) => (
          <DamagePartEditor
            key={partIndex}
            part={part}
            actionIndex={actionIndex}
            partIndex={partIndex}
            handlePartChange={handlePartChange}
            validateAndSetNumber={validateAndSetNumber}
            removePart={removePart}
            damageTypes={damageTypes}
            diceTypes={diceTypes}
            partsLength={action.parts.length}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          paddingTop: "0.25rem",
        }}
      >
        <ActionButton
          onClick={() => addPart(actionIndex)}
          backgroundColor="#2563eb"
          shadowColor="rgba(37,99,235,0.22)"
        >
          Add Part
        </ActionButton>

        {actionsLength > 1 && (
          <ActionButton
            onClick={() => removeAction(actionIndex)}
            backgroundColor="#ef4444"
            shadowColor="rgba(239,68,68,0.22)"
          >
            Remove Action
          </ActionButton>
        )}
      </div>
    </div>
  );
}