"use client";
import { useCallback, useEffect, useState } from "react";

interface DrawingCursorProps {
  color: string;
  size: number;
  isVisible: boolean;
}

const DrawingCursor: React.FC<DrawingCursorProps> = ({
  color,
  size,
  isVisible,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isVisible, handleMouseMove]);

  // Show cursor when visible (keep visible during drawing for better UX)
  if (!isVisible) return null;

  // Calculate cursor size based on brush size - make it more prominent
  const cursorSize = Math.max(50, Math.min(90, size * 1.5 + 40));
  const brushIndicatorSize = Math.max(3, Math.min(12, size / 2));

  // Calculate precise pen tip offset for 45-degree rotation
  // In the SVG viewBox (100x100), pen tip is at (19, 83)
  // After 45-degree rotation, we need to calculate the rotated position
  const penTipX = 19; // pen tip x in viewBox
  const penTipY = 83; // pen tip y in viewBox
  const centerX = 50; // center of 100x100 viewBox
  const centerY = 50; // center of 100x100 viewBox

  // Convert to normalized coordinates (relative to center)
  const relativeX = (penTipX - centerX) / 100; // -0.31
  const relativeY = (penTipY - centerY) / 100; // 0.33

  // Apply 45-degree rotation matrix
  const angle = Math.PI / 4; // 45 degrees in radians
  const rotatedX = relativeX * Math.cos(angle) - relativeY * Math.sin(angle);
  const rotatedY = relativeX * Math.sin(angle) + relativeY * Math.cos(angle);

  // Convert back to pixel offset
  const offsetX = rotatedX * cursorSize;
  const offsetY = rotatedY * cursorSize;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-all duration-75 ease-out"
      style={{
        // Position using calculated offsets so pen tip aligns exactly with drawing point
        left: position.x - offsetX - cursorSize / 2,
        top: position.y - offsetY - cursorSize / 2,
        opacity: isVisible ? 1 : 0,
        transform: isVisible
          ? "scale(1) rotate(45deg)"
          : "scale(0.8) rotate(45deg)",
      }}
    >
      {/* Realistic Tilted Pen SVG */}
      <svg
        width={cursorSize}
        height={cursorSize}
        viewBox="0 0 100 100"
        fill="none"
        className="drop-shadow-lg filter"
        style={{
          filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.6))",
        }}
      >
        {/* Pen shadow for depth */}
        <g transform="translate(2,2)" opacity="0.3">
          <rect x="15" y="10" width="12" height="60" rx="6" fill="#000000" />
          <polygon points="21,70 15,85 27,85" fill="#000000" />
          <circle cx="21" cy="85" r="2" fill="#000000" />
        </g>

        {/* Main pen body (blue ballpoint pen) */}
        <rect
          x="13"
          y="8"
          width="12"
          height="60"
          rx="6"
          fill="#2563eb"
          stroke="#1e40af"
          strokeWidth="0.8"
        />

        {/* Pen cap/clip area */}
        <rect x="13" y="8" width="12" height="15" rx="6" fill="#1e40af" />

        {/* Pen clip */}
        <rect x="24" y="10" width="2" height="8" rx="1" fill="#94a3b8" />

        {/* Brand ring */}
        <rect x="13" y="25" width="12" height="2" fill="#fbbf24" />

        {/* Grip section with texture */}
        <rect x="13" y="45" width="12" height="15" fill="#374151" rx="2" />
        <line
          x1="14"
          y1="47"
          x2="24"
          y2="47"
          stroke="#6b7280"
          strokeWidth="0.3"
        />
        <line
          x1="14"
          y1="49"
          x2="24"
          y2="49"
          stroke="#6b7280"
          strokeWidth="0.3"
        />
        <line
          x1="14"
          y1="51"
          x2="24"
          y2="51"
          stroke="#6b7280"
          strokeWidth="0.3"
        />
        <line
          x1="14"
          y1="53"
          x2="24"
          y2="53"
          stroke="#6b7280"
          strokeWidth="0.3"
        />
        <line
          x1="14"
          y1="55"
          x2="24"
          y2="55"
          stroke="#6b7280"
          strokeWidth="0.3"
        />
        <line
          x1="14"
          y1="57"
          x2="24"
          y2="57"
          stroke="#6b7280"
          strokeWidth="0.3"
        />

        {/* Pen cone/tip section (golden) */}
        <polygon
          points="13,68 25,68 23,78 15,78"
          fill="#fbbf24"
          stroke="#f59e0b"
          strokeWidth="0.6"
        />

        {/* Pen tip/nib (where the ink comes out) */}
        <polygon points="15,78 23,78 21,83 17,83" fill="#1f2937" />

        {/* Actual drawing tip (the point that touches paper) */}
        <circle
          cx="19"
          cy="83"
          r={brushIndicatorSize}
          fill={color}
          opacity="0.9"
          stroke="#1f2937"
          strokeWidth="1"
        />

        {/* Inner drawing tip */}
        <circle
          cx="19"
          cy="83"
          r={Math.max(1, brushIndicatorSize - 2)}
          fill={color}
          opacity="1"
        />

        {/* Size indicator text near the tip */}
        {size > 8 && (
          <text
            x="35"
            y="88"
            textAnchor="middle"
            fontSize="8"
            fill={color}
            fontWeight="bold"
            style={{
              filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.8))",
            }}
          >
            {size}px
          </text>
        )}
      </svg>
    </div>
  );
};

export default DrawingCursor;
