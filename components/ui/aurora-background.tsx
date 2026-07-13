export function AuroraBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div
        className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full animate-aurora-1"
        style={{
          background: "radial-gradient(circle at 30% 50%, rgba(255,70,85,0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full animate-aurora-2"
        style={{
          background: "radial-gradient(circle at 70% 30%, rgba(168,85,247,0.1) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        className="absolute -bottom-1/3 left-1/3 w-[600px] h-[600px] rounded-full animate-aurora-3"
        style={{
          background: "radial-gradient(circle at 50% 70%, rgba(56,189,248,0.08) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}
