export default function BrandMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="15" fill="#0f211c" stroke="#1c3a2d" />
      <path d="M9 20L15 10L21 16L23 12" stroke="#49e6a6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="2.4" fill="#49e6a6" />
      <circle cx="15" cy="10" r="2.4" fill="#eaf6ef" />
      <circle cx="21" cy="16" r="2.4" fill="#49e6a6" />
      <circle cx="23" cy="12" r="1.6" fill="#4fb8e6" />
    </svg>
  );
}
