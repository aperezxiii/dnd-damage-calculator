import { useState } from "react";
import DamagePartEditor from "./DamagePartEditor";
import Button from "./ui/Button";
import { fieldLabelStyle, sectionLabelStyle, selectStyle } from "./ui/formStyles";

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
          <label style={fieldLabelStyle}>
            <span
              style={sectionLabelStyle}
            >
              Crit Mode
            </span>
            <select
              value={action.critType}
              onChange={(e) => handleCritTypeChange(actionIndex, e.target.value)}
              style={selectStyle}
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
        <Button onClick={() => addPart(actionIndex)} variant="primary">
          Add Part
        </Button>

        {actionsLength > 1 && (
          <Button onClick={() => removeAction(actionIndex)} variant="danger">
            Remove Action
          </Button>
        )}
      </div>
    </div>
  );
}