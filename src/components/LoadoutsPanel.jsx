import { useState } from "react";
import Button from "./ui/Button";
import { inputStyle } from "./ui/formStyles";

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
            <Button onClick={() => loadLoadout(loadout.id)} variant="primary">
              Load
            </Button>

            <Button onClick={() => addLoadoutAsNewAction(loadout.id)} variant="primary">
              + New Action
            </Button>
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
            <Button
              onClick={() => setShowTargetSelector((prev) => !prev)}
              variant="secondary"
              disabled={!canAddToAction}
            >
              {!canAddToAction ? "Add to Action (1 action only)" : "Add to Action"}
            </Button>

            <Button
              onClick={() => deleteLoadout(loadout.id)}
              variant="secondary"
              style={{ color: "#b91c1c", border: "1px solid #fca5a5" }}
            >
              Delete
            </Button>
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
              <Button
                key={actionIndex}
                onClick={() => handleTargetClick(actionIndex)}
                variant="secondary"
              >
                Action {actionIndex + 1}
              </Button>
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
  loadoutMessage,
  loadoutMessageType,
  showBuilderCTA,
  goToBuilder,
  loadouts,
  saveLoadout,
  loadLoadout,
  addLoadoutAsNewAction,
  addLoadoutToAction,
  deleteLoadout,
  actions,
  storageLabel,
  pendingDeletedLoadout,
  undoDeleteLoadout,
}) {
  const isError = loadoutMessageType === "error";
  const bannerActionColor = isError ? "#991b1b" : "#065f46";
  const bannerActionBorder = isError ? "#fecaca" : "#a7f3d0";

  const getBannerTitle = () => {
    if (isError) return "Loadout Error";

    const message = loadoutMessage.toLowerCase();

    if (message.startsWith("saved ")) return "Loadout Saved";
    if (message.startsWith("loaded ")) return "Loadout Applied";
    if (message.startsWith("added ") && message.includes("new action")) return "Action Added";
    if (message.startsWith("added ") && message.includes("to action")) return "Loadout Applied";
    if (message.startsWith("deleted ")) return "Loadout Deleted";
    if (message.startsWith("restored ")) return "Loadout Restored";

    return "Loadout Updated";
  };

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
          Save your attack setup as a reusable neutral template, then use Load, + New Action, or Add to Action to apply it.
        </p>
      </div>

      <div
        style={{
          marginTop: "0.85rem",
          marginBottom: "1.1rem",
          padding: "0.8rem 0.95rem",
          backgroundColor: "#f8fafc",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          color: "#475569",
          fontSize: "0.9rem",
          fontWeight: "600",
        }}
      >
        {storageLabel}
      </div>

      {loadoutMessage && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.95rem 1rem",
            backgroundColor: isError ? "#fef2f2" : "#ecfdf5",
            border: isError ? "1px solid #fecaca" : "1px solid #a7f3d0",
            borderRadius: "12px",
            color: isError ? "#991b1b" : "#065f46",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "0.9rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "0.7rem",
              flex: "1 1 320px",
              minWidth: "240px",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                lineHeight: 1,
                marginTop: "0.05rem",
              }}
            >
              {isError ? "❌" : "✅"}
            </div>

            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: "700",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  opacity: 0.8,
                  marginBottom: "0.2rem",
                }}
              >
                {getBannerTitle()}
              </div>

              <div
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  lineHeight: 1.45,
                }}
              >
                {loadoutMessage}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {pendingDeletedLoadout && (
              <Button
                onClick={undoDeleteLoadout}
                variant="secondary"
                size="sm"
                style={{
                  color: bannerActionColor,
                  border: `1px solid ${bannerActionBorder}`,
                  backgroundColor: "#ffffff",
                }}
              >
                Undo
              </Button>
            )}

            {showBuilderCTA && (
              <Button
                onClick={goToBuilder}
                variant="secondary"
                size="sm"
                style={{
                  color: bannerActionColor,
                  border: `1px solid ${bannerActionBorder}`,
                  backgroundColor: "#ffffff",
                }}
              >
                Go to Builder
              </Button>
            )}
          </div>
        </div>
      )}

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
            ...inputStyle,
            flex: "1 1 280px",
            minWidth: "240px",
          }}
        />

        <Button onClick={saveLoadout} variant="primary" size="lg">
          Save Loadout
        </Button>
      </div>

      {loadouts.length === 0 ? (
        <div
          style={{
            padding: "1.5rem",
            textAlign: "center",
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