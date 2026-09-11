export default function BrandMark({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ecomind-mark-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8b7cf6" />
          <stop offset="100%" stopColor="#2dd4bf" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#120b26" stroke="url(#ecomind-mark-grad)" strokeOpacity="0.6" />
      {/* a located "ping" — an AI-spotted incident on a map, the product's core act */}
      <path
        d="M16 7c-3.6 0-6.4 2.75-6.4 6.2 0 4.65 6.4 11.3 6.4 11.3s6.4-6.65 6.4-11.3C22.4 9.75 19.6 7 16 7Z"
        fill="url(#ecomind-mark-grad)"
      />
      <circle cx="16" cy="13.2" r="2.3" fill="#0c0e1f" />
    </svg>
  );
}
