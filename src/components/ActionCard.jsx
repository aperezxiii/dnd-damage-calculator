import DamagePartEditor from "./DamagePartEditor";

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
  return (
    <div
      style={{
        marginBottom: '1.25rem',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: '700',
              color: '#111827',
            }}
          >
            Attack Action {actionIndex + 1}
          </h3>
          <p
            style={{
              margin: '0.35rem 0 0 0',
              fontSize: '0.92rem',
              color: '#6b7280',
            }}
          >
            Configure crit behavior and damage parts for this attack.
          </p>
        </div>

        <div
          style={{
            minWidth: '220px',
            padding: '0.85rem 1rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #f3f4f6',
            borderRadius: '12px',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '700',
                color: '#6b7280',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}
            >
              Crit Mode
            </span>
            <select
              value={action.critType}
              onChange={(e) => handleCritTypeChange(actionIndex, e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
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

      <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
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
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          paddingTop: '0.25rem',
        }}
      >
        <button
          onClick={() => addPart(actionIndex)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Add Part
        </button>

        {actionsLength > 1 && (
          <button
            onClick={() => removeAction(actionIndex)}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Remove Action
          </button>
        )}
      </div>
    </div>
  );
}