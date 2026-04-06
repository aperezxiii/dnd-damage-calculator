import { Switch } from "./ui/switch";
import Button from "./ui/Button";
import {
  inputStyle,
  selectStyle,
  fieldLabelStyle,
  sectionLabelStyle,
  toggleCardStyle,
  toggleLabelStyle,
} from "./ui/formStyles";

export default function DamagePartEditor({
  part,
  actionIndex,
  partIndex,
  handlePartChange,
  validateAndSetNumber,
  removePart,
  damageTypes,
  diceTypes,
  partsLength,
}) {
  return (
    <div
      style={{
        padding: "1rem",
        backgroundColor: "#f9fafb",
        border: "1px solid #f3f4f6",
        borderRadius: "12px",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
          marginBottom: "0.9rem",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "1rem",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Damage Part {partIndex + 1}
        </h4>

        {partsLength > 1 && (
          <Button
            onClick={() => removePart(actionIndex, partIndex)}
            variant="danger"
            size="sm"
          >
            Remove Part
          </Button>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={sectionLabelStyle}>
          Identity
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <label style={fieldLabelStyle}>
            <span>Name</span>
            <input
              style={inputStyle}
              value={part.name}
              onChange={(e) => handlePartChange(actionIndex, partIndex, "name", e.target.value)}
              placeholder="e.g., Longsword"
            />
          </label>

         <label style={fieldLabelStyle}>
            <span>Damage Type</span>
            <select
              style={selectStyle}
              value={part.damageType}
              onChange={(e) => handlePartChange(actionIndex, partIndex, "damageType", e.target.value)}
            >
              {damageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={sectionLabelStyle}>
          Dice Setup
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          <label style={fieldLabelStyle}>
            <span>Dice Count</span>
            <input
              style={inputStyle}
              type="text"
              value={part.diceCount}
              onChange={(e) => handlePartChange(actionIndex, partIndex, "diceCount", e.target.value)}
              onBlur={(e) =>
                validateAndSetNumber(actionIndex, partIndex, "diceCount", e.target.value, "1", 1)
              }
              placeholder="1"
            />
          </label>

          <label style={fieldLabelStyle}>
            <span>Dice Type</span>
            <select
              style={selectStyle}
              value={part.diceType}
              onChange={(e) => handlePartChange(actionIndex, partIndex, "diceType", e.target.value)}
            >
              {diceTypes.map((die) => (
                <option key={die} value={die}>
                  {die}
                </option>
              ))}
            </select>
          </label>

          <label style={fieldLabelStyle}>
            <span>Modifier</span>
            <input
              style={inputStyle}
              type="text"
              value={part.modifier}
              onChange={(e) => handlePartChange(actionIndex, partIndex, "modifier", e.target.value)}
              onBlur={(e) =>
                validateAndSetNumber(actionIndex, partIndex, "modifier", e.target.value, "0")
              }
              placeholder="0"
            />
          </label>
        </div>
      </div>

      <div>
        <div style={sectionLabelStyle}>
          Damage Modifiers
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div style={toggleCardStyle}>
            <span
              style={toggleLabelStyle}
            >
              Vulnerable
            </span>
            <Switch
              checked={part.vulnerable}
              onCheckedChange={(checked) =>
                handlePartChange(actionIndex, partIndex, "vulnerable", checked)
              }
            />
          </div>

          <div style={toggleCardStyle}>
            <span
              style={toggleLabelStyle}
            >
              Resistant
            </span>
            <Switch
              checked={part.resistant}
              onCheckedChange={(checked) =>
                handlePartChange(actionIndex, partIndex, "resistant", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}