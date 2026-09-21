import Button from "../ui/Button";
import { darkInputStyle } from "../ui/formStyles";

export default function AuthPanel({
  user,
  email,
  password,
  setEmail,
  setPassword,
  handleSignIn,
  handleSignUp,
  handleSignOut,
  authMessage,
  authMessageType,
}) {
  return (
    <>
      <div
        style={{
          marginTop: "0.85rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.65rem",
          alignItems: "center",
        }}
      >
        {user ? (
          <div
            style={{
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            Signed in as: <strong>{user.email}</strong>
          </div>
        ) : (
          <div
            style={{
              fontSize: "0.9rem",
              color: "#9ca3af",
            }}
          >
            Not signed in
          </div>
        )}

        <div
          style={{
            padding: "0.35rem 0.65rem",
            borderRadius: "999px",
            fontSize: "0.8rem",
            fontWeight: "700",
            backgroundColor: user ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.08)",
            color: user ? "#bbf7d0" : "#d1d5db",
            border: user
              ? "1px solid rgba(34,197,94,0.3)"
              : "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {user ? "Cloud Save Active" : "Local Save Only"}
        </div>
      </div>

      <div
        style={{
          marginTop: "1rem",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "flex-end",
        }}
      >
        {!user ? (
          <>
            <input
              className="auth-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                ...darkInputStyle,
                width: "auto",
                flex: "1 1 260px",
                minWidth: "220px",
                maxWidth: "320px",
              }}
            />

            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                ...darkInputStyle,
                width: "auto",
                flex: "1 1 220px",
                minWidth: "180px",
                maxWidth: "280px",
              }}
            />

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button onClick={handleSignIn} variant="primary" size="lg">
                Sign In
              </Button>

              <Button onClick={handleSignUp} variant="dark" size="lg">
                Sign Up
              </Button>
            </div>
          </>
        ) : (
          <Button onClick={handleSignOut} variant="danger" size="lg">
            Sign Out
          </Button>
        )}
      </div>

      {authMessage && (
        <div
          style={{
            marginTop: "0.9rem",
            maxWidth: "720px",
            padding: "0.85rem 0.95rem",
            backgroundColor:
              authMessageType === "error"
                ? "rgba(127,29,29,0.22)"
                : "rgba(34,197,94,0.14)",
            border:
              authMessageType === "error"
                ? "1px solid rgba(248,113,113,0.35)"
                : "1px solid rgba(74,222,128,0.28)",
            borderRadius: "12px",
            color: authMessageType === "error" ? "#fecaca" : "#dcfce7",
            fontSize: "0.92rem",
            fontWeight: "600",
            lineHeight: 1.45,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "0.95rem", lineHeight: 1 }}>
            {authMessageType === "error" ? "❌" : "✅"}
          </span>
          <span>{authMessage}</span>
        </div>
      )}
    </>
  );
}