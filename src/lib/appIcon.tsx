// App-Symbol: eine Redner-Ampel (grün, gelb, rot) auf dunklem Grund
export function AppIcon({ size }: { size: number }) {
  const dot = size * 0.2;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.06,
        background: "#18181b",
      }}
    >
      {["#22c55e", "#facc15", "#ef4444"].map((color) => (
        <div
          key={color}
          style={{ width: dot, height: dot, borderRadius: dot, background: color }}
        />
      ))}
    </div>
  );
}
