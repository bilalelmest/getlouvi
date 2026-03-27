export default function Logo({ size = 36, showText = true, whiteText = false }: { size?: number; showText?: boolean; whiteText?: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: size * 0.2 }}>
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: "linear-gradient(140deg, #7C3AED, #4F46E5)",
        }}
      >
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="8.5" cy="10" r="1" fill="#fff" stroke="none" />
          <circle cx="12" cy="10" r="1" fill="#fff" stroke="none" />
          <circle cx="15.5" cy="10" r="1" fill="#fff" stroke="none" />
        </svg>
      </div>
      {showText && (
        <span
          className="font-serif font-bold"
          style={{
            fontSize: size * 0.7,
            color: whiteText ? "#FFFFFF" : "#0F172A",
            letterSpacing: -1,
          }}
        >
          Louvi
        </span>
      )}
    </div>
  );
}
