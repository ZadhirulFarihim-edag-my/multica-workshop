const shellStyle = {
  border: "1px solid rgba(148, 163, 184, 0.18)",
  background: "rgba(15, 23, 42, 0.72)",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(2, 8, 23, 0.3)",
};

const skeletonStyle = {
  background: "rgba(148, 163, 184, 0.08)",
  borderRadius: "999px",
};

export default function TeamLoading() {
  return (
    <main style={{ minHeight: "100vh", padding: "32px" }}>
      <div
        style={{
          margin: "0 auto",
          maxWidth: "1240px",
          display: "grid",
          gap: "20px",
        }}
      >
        <div style={{ ...shellStyle, padding: "28px" }}>
          <div style={{ ...skeletonStyle, width: "min(420px, 70%)", height: 22 }} />
          <div style={{ height: 12 }} />
          <div style={{ ...skeletonStyle, width: "min(560px, 85%)", height: 14 }} />
        </div>

        <div
          style={{
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                ...shellStyle,
                padding: "20px",
                display: "grid",
                gap: "12px",
                minHeight: "220px",
              }}
            >
              <div style={{ ...skeletonStyle, width: 56, height: 56, borderRadius: 18 }} />
              <div style={{ ...skeletonStyle, width: "72%", height: 18 }} />
              <div style={{ ...skeletonStyle, width: "88%", height: 14 }} />
              <div style={{ ...skeletonStyle, width: "78%", height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
