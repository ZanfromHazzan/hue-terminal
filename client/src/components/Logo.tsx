interface Props {
  size?: number;
  className?: string;
}

const BLADE_COLORS = ['#1e3a6e', '#1e3a6e', '#1e3a6e', '#1e3a6e', '#1e3a6e', '#a78bfa'];

export function Logo({ size = 28, className }: Props) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}>
      {BLADE_COLORS.map((color, i) => (
        <path
          key={i}
          d="M50 50 C50 26 59 12 75 6 C70 22 62 36 50 50 Z"
          fill={color}
          transform={`rotate(${i * 60} 50 50)`}
        />
      ))}
    </svg>
  );
}
