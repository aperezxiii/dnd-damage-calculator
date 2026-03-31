import { useState } from "react";

function PanelButton({
  children,
  onClick,
  backgroundColor,
  textColor = "white",
  border = "none",
  disabled = false,
  style = {},
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled}
      style={{
        backgroundColor,
        color: textColor,
        border,
        padding: "0.65rem 0.95rem",
        borderRadius: "10px",
        fontWeight: "700",
        fontSize: "0.92rem",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease",
        transform: disabled
          ? "translateY(0)"
          : isPressed
          ? "scale(0.98)"
          : isHovered
          ? "translateY(-1px)"
          : "translateY(0)",
        boxShadow: !disabled && isHovered ? "0 8px 18px rgba(0,0,0,0.08)" : "none",
        opacity: disabled ? 0.5 : isHovered ? 0.97 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function formatTimestamp(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString();
}

function getLoadoutSummary(loadout) {
  const actionCount = loadout.actionsSnapshot?.length || 0;
  const partCount = (loadout.actionsSnapshot || []).reduce((sum, action) => {
    return sum + (action.parts?.length || 0);
  }, 0);

  return `${actionCount} action${actionCount !== 1 ? "s" : ""} • ${partCount} part${partCount !== 1 ? "s" : ""}`;
}

function LoadoutRow({
  loadout,
  loadLoadout,
  addLoadoutAsNewAction,
  addLoadoutToAction,
  deleteLoadout,
  actions,
}) {
  const [showTargetSelector, setShowTargetSelector] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const hasExistingActions = actions.length > 0;
  const isSingleActionLoadout = (loadout.actionsSnapshot?.length || 0) === 1;
  const canAddToAction = hasExistingActions && isSingleActionLoadout;

  const handleTargetClick = (actionIndex) => {
    addLoadoutToAction(loadout.id, actionIndex);
    setShowTargetSelector(false);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)} 
      style={{
        padding: "0.95rem 1rem",
        backgroundColor: "#f9fafb",
        border: "1px solid #f3f4f6",
        borderRadius: "12px",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        boxShadow: isHovered
        ? "0 8px 20px rgba(0,0,0,0.06)"
        : "0 2px 8px rgba(0,0,0,0.03)",
        transform: isHovered ? "translateY(-1px)" : "translateY(0)",
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
        <div style={{ flex: "1 1 320px" }}>
          <div
            style={{
              fontSize: "1rem",
              fontWeight: "700",
              color: "#111827",
              marginBottom: "0.3rem",
            }}
          >
            {loadout.name}
          </div>

          <div
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
              marginBottom: "0.25rem",
            }}
          >
            {getLoadoutSummary(loadout)}
          </div>

          <div
            style={{
              fontSize: "0.78rem",
              color: "#94a3b8",
              marginBottom: canAddToAction ? 0 : "0.25rem",
            }}
          >
            Updated: {formatTimestamp(loadout.updatedAt)}
          </div>

          {!isSingleActionLoadout && (
            <div
              style={{
                fontSize: "0.82rem",
                color: "#9ca3af",
                marginTop: "0.25rem",
              }}
            >
              Add to Action is available for single-action loadouts only.
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <PanelButton onClick={() => loadLoadout(loadout.id)} backgroundColor="#16a34a">
              Load
            </PanelButton>

            <PanelButton onClick={() => addLoadoutAsNewAction(loadout.id)} backgroundColor="#2563eb" style={{ opacity: 0.92 }}>
              + New Action
            </PanelButton>
          </div>
          
          <div
            style={{
              width: "1px",
              height: "100%",
              minHeight: "24px",
              alignSelf: "stretch",
              backgroundColor: "#e5e7eb",
              margin: "0 0.25rem",
            }}
          />

          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <PanelButton
              onClick={() => setShowTargetSelector((prev) => !prev)}
              backgroundColor="#ffffff"
              textColor="#111827"
              border="1px solid #d1d5db"
              disabled={!canAddToAction}
            >
              {!canAddToAction ? "Add to Action (1 action only)" : "Add to Action"}
            </PanelButton>

            <PanelButton
              onClick={() => deleteLoadout(loadout.id)}
              backgroundColor="#ffffff"
              textColor="#b91c1c"
              border="1px solid #fca5a5"
            >
              Delete
            </PanelButton>
          </div>
        </div>
      </div>

      {showTargetSelector && canAddToAction && (
        <div
          style={{
            marginTop: "0.85rem",
            padding: "0.85rem",
            backgroundColor: "#f3f4f6",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              marginBottom: "0.6rem",
            }}
          >
            Add to which action?
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            {actions.map((_, actionIndex) => (
              <PanelButton
                key={actionIndex}
                onClick={() => handleTargetClick(actionIndex)}
                backgroundColor="#ffffff"
                textColor="#111827"
                border="1px solid #cbd5e1"
              >
                Action {actionIndex + 1}
              </PanelButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoadoutsPanel({
  loadoutName,
  setLoadoutName,
  loadouts,
  saveLoadout,
  loadLoadout,
  addLoadoutAsNewAction,
  addLoadoutToAction,
  deleteLoadout,
  actions,
}) {
  return (
    <div
      style={{
        marginBottom: "1.5rem",
        padding: "1.25rem",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "1.2rem",
            fontWeight: "700",
            color: "#111827",
          }}
        >
          Loadouts
        </h2>
        <p
          style={{
            margin: "0.35rem 0 0 0",
            fontSize: "0.94rem",
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          Save your attack setup as a reusable neutral template, then replace, append, or add it as a new action.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "stretch",
          marginBottom: "1rem",
        }}
      >
        <input
          type="text"
          value={loadoutName}
          onChange={(e) => setLoadoutName(e.target.value)}
          placeholder="Enter loadout name"
          style={{
            flex: "1 1 280px",
            minWidth: "240px",
            padding: "0.8rem 0.9rem",
            border: "1px solid #d1d5db",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            fontSize: "0.95rem",
            color: "#111827",
            boxSizing: "border-box",
          }}
        />

        <PanelButton onClick={saveLoadout} backgroundColor="#2563eb">
          Save Loadout
        </PanelButton>
      </div>

      {loadouts.length === 0 ? (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f9fafb",
            border: "1px dashed #d1d5db",
            borderRadius: "12px",
            color: "#6b7280",
            fontSize: "0.94rem",
          }}
        >
          No loadouts yet. Save your current setup to reuse it.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.8rem" }}>
          {loadouts.map((loadout) => (
            <LoadoutRow
              key={loadout.id}
              loadout={loadout}
              loadLoadout={loadLoadout}
              addLoadoutAsNewAction={addLoadoutAsNewAction}
              addLoadoutToAction={addLoadoutToAction}
              deleteLoadout={deleteLoadout}
              actions={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}