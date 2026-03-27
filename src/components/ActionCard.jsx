import { Switch } from "./ui/switch";
import DamagePartEditor from "./DamagePartEditor";

export default function ActionCard({
  action,
  actionIndex,
  actionsLength,
  toggleCrit,
  addPart,
  removeAction,
  handlePartChange,
  validateAndSetNumber,
  removePart,
  damageTypes,
  diceTypes,
}) {
  return (
    <div
      style={{
        border: '2px solid #ddd',
        marginBottom: '1rem',
        padding: '1rem',
      }}
    >
      <h3
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>Attack Action {actionIndex + 1}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Switch
            checked={action.isCrit}
            onCheckedChange={() => toggleCrit(actionIndex)}
          />
          <span>{action.isCrit ? "Crit On" : "Crit Off"}</span>
        </div>
      </h3>

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

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => addPart(actionIndex)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
          }}
        >
          Add Part
        </button>

        {actionsLength > 1 && (
          <button
            onClick={() => removeAction(actionIndex)}
            style={{
              backgroundColor: '#ff6666',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
            }}
          >
            Remove Action
          </button>
        )}
      </div>
    </div>
  );
}