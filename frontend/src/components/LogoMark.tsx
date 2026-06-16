// src/components/LogoMark.tsx
export default function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
      <rect
        x="8"
        y="17"
        width="4"
        height="7"
        rx="1"
        fill="#0F172A"
        opacity="0.6"
      />
      <rect
        x="14"
        y="12"
        width="4"
        height="12"
        rx="1"
        fill="#0F172A"
        opacity="0.8"
      />
      <rect x="20" y="8" width="4" height="16" rx="1" fill="#0F172A" />
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2D8CFF" />
          <stop offset="100%" stopColor="#7ED7FF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
