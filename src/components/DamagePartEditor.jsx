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
    <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #ccc' }}>
      <h4>Damage Part {partIndex + 1}</h4>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label>
          Name: 
          <input 
            style={{ width: '100%', marginLeft: '0.5rem' }}
            value={part.name} 
            onChange={(e) => handlePartChange(actionIndex, partIndex, 'name', e.target.value)} 
            placeholder="e.g., Longsword"
          />
        </label>

        <label>
          Damage Type:
          <select 
            style={{ width: '100%', marginLeft: '0.5rem' }}
            value={part.damageType} 
            onChange={(e) => handlePartChange(actionIndex, partIndex, 'damageType', e.target.value)}
          >
            {damageTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <label>
          Dice Count:
          <input
            style={{ width: '100%', marginLeft: '0.5rem' }}
            type="text"
            value={part.diceCount}
            onChange={(e) => handlePartChange(actionIndex, partIndex, 'diceCount', e.target.value)}
            onBlur={(e) => validateAndSetNumber(actionIndex, partIndex, 'diceCount', e.target.value, '1', 1)}
            placeholder="1"
          />
        </label>

        <label>
          Dice Type:
          <select 
            style={{ width: '100%', marginLeft: '0.5rem' }}
            value={part.diceType} 
            onChange={(e) => handlePartChange(actionIndex, partIndex, 'diceType', e.target.value)}
          >
            {diceTypes.map(die => (
              <option key={die} value={die}>{die}</option>
            ))}
          </select>
        </label>

        <label>
          Modifier:
          <input
            style={{ width: '100%', marginLeft: '0.5rem' }}
            type="text"
            value={part.modifier}
            onChange={(e) => handlePartChange(actionIndex, partIndex, 'modifier', e.target.value)}
            onBlur={(e) => validateAndSetNumber(actionIndex, partIndex, 'modifier', e.target.value, '0')}
            placeholder="0"
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input 
            type="checkbox" 
            checked={part.vulnerable} 
            onChange={() => handlePartChange(actionIndex, partIndex, 'vulnerable', !part.vulnerable)} 
          />
          Vulnerable
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <input 
            type="checkbox" 
            checked={part.resistant} 
            onChange={() => handlePartChange(actionIndex, partIndex, 'resistant', !part.resistant)} 
          />
          Resistant
        </label>
      </div>

      {/** IMPORTANT: keep conditional exactly same */}
      {partsLength > 1 && (
  <button 
    onClick={() => removePart(actionIndex, partIndex)}
    style={{ backgroundColor: '#ff4444', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px' }}
  >
    Remove Part
  </button>
)}
    </div>
  );
}