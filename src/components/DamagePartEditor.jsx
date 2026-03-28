import { Switch } from "./ui/switch";

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
        padding: '1rem',
        backgroundColor: '#f9fafb',
        border: '1px solid #f3f4f6',
        borderRadius: '12px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '0.9rem',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '700',
            color: '#111827',
          }}
        >
          Damage Part {partIndex + 1}
        </h4>

        {partsLength > 1 && (
          <button
            onClick={() => removePart(actionIndex, partIndex)}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Remove Part
          </button>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#6b7280',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Identity
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            <span>Name</span>
            <input
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
                boxSizing: 'border-box',
              }}
              value={part.name}
              onChange={(e) => handlePartChange(actionIndex, partIndex, 'name', e.target.value)}
              placeholder="e.g., Longsword"
            />
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            <span>Damage Type</span>
            <select
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
                boxSizing: 'border-box',
              }}
              value={part.damageType}
              onChange={(e) => handlePartChange(actionIndex, partIndex, 'damageType', e.target.value)}
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

      <div style={{ marginBottom: '1rem' }}>
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#6b7280',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Dice Setup
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            <span>Dice Count</span>
            <input
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
                boxSizing: 'border-box',
              }}
              type="text"
              value={part.diceCount}
              onChange={(e) => handlePartChange(actionIndex, partIndex, 'diceCount', e.target.value)}
              onBlur={(e) =>
                validateAndSetNumber(actionIndex, partIndex, 'diceCount', e.target.value, '1', 1)
              }
              placeholder="1"
            />
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            <span>Dice Type</span>
            <select
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
                boxSizing: 'border-box',
              }}
              value={part.diceType}
              onChange={(e) => handlePartChange(actionIndex, partIndex, 'diceType', e.target.value)}
            >
              {diceTypes.map((die) => (
                <option key={die} value={die}>
                  {die}
                </option>
              ))}
            </select>
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              fontSize: '0.92rem',
              fontWeight: '600',
              color: '#374151',
            }}
          >
            <span>Modifier</span>
            <input
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '0.95rem',
                color: '#111827',
                boxSizing: 'border-box',
              }}
              type="text"
              value={part.modifier}
              onChange={(e) => handlePartChange(actionIndex, partIndex, 'modifier', e.target.value)}
              onBlur={(e) =>
                validateAndSetNumber(actionIndex, partIndex, 'modifier', e.target.value, '0')
              }
              placeholder="0"
            />
          </label>
        </div>
      </div>

      <div>
        <div
          style={{
            marginBottom: '0.5rem',
            fontSize: '0.78rem',
            fontWeight: '700',
            color: '#6b7280',
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
          }}
        >
          Damage Modifiers
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              minWidth: '180px',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
            }}
          >
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Vulnerable
            </span>
            <Switch
              checked={part.vulnerable}
              onCheckedChange={(checked) =>
                handlePartChange(actionIndex, partIndex, 'vulnerable', checked)
              }
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              minWidth: '180px',
              padding: '0.65rem 0.85rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
            }}
          >
            <span
              style={{
                fontSize: '0.92rem',
                fontWeight: '600',
                color: '#374151',
              }}
            >
              Resistant
            </span>
            <Switch
              checked={part.resistant}
              onCheckedChange={(checked) =>
                handlePartChange(actionIndex, partIndex, 'resistant', checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}