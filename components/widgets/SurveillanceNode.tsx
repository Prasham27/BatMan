export interface SurveillanceNodeProps {
  size?: number;
  className?: string;
}

export function SurveillanceNode({ size = 220, className }: SurveillanceNodeProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Surveillance node schematic"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" className="text-signal">
        <circle cx="120" cy="120" r="110" opacity="0.18" />
        <circle cx="120" cy="120" r="80" opacity="0.32" />
        <circle cx="120" cy="120" r="50" opacity="0.5" />
        <circle cx="120" cy="120" r="22" opacity="0.85" />

        <line x1="120" y1="0" x2="120" y2="240" opacity="0.18" strokeDasharray="2 4" />
        <line x1="0" y1="120" x2="240" y2="120" opacity="0.18" strokeDasharray="2 4" />

        <line x1="120" y1="120" x2="190" y2="50" opacity="0.7" />

        <path d="M 8 8 L 8 22 M 8 8 L 22 8" />
        <path d="M 232 8 L 232 22 M 232 8 L 218 8" />
        <path d="M 8 232 L 8 218 M 8 232 L 22 232" />
        <path d="M 232 232 L 232 218 M 232 232 L 218 232" />
      </g>

      <circle cx="190" cy="50" r="4" className="fill-signal" />
      <circle cx="120" cy="120" r="3" className="fill-text-muted" />

      <g
        className="fill-text-muted"
        opacity="0.85"
        fontFamily="ui-monospace, monospace"
        fontSize="7"
        letterSpacing="1"
      >
        <text x="195" y="46">NODE-04</text>
        <text x="195" y="56">28.1°N 72.6°E</text>
        <text x="10" y="20">RANGE 110</text>
        <text x="10" y="234">SCAN ACTIVE</text>
      </g>
    </svg>
  );
}
