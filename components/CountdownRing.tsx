export function CountdownRing({ ratio, danger }: { ratio: number; danger: boolean }) {
  const size = 40;
  const stroke = 3.5;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.max(0, Math.min(1, ratio)));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={danger ? "animate-pulseRing" : ""}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#DFE2E8" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={danger ? "#C22B1D" : "#1D3FD1"}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 200ms linear, stroke 300ms" }}
      />
    </svg>
  );
}
