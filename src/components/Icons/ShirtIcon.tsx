import { FC } from "react";
import tinycolor from "tinycolor2";

interface ShirtIconProps {
  color?: string;
  size?: number;
}

const ShirtIcon: FC<ShirtIconProps> = ({ color, size = 42, ...rest }) => {
  const mainColor = tinycolor(color);
  const borderColor = mainColor.isDark() ? mainColor.lighten(30) : mainColor.darken(50);

  return (
    <svg
      className="shirtIcon"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill={color ? color : "#2C3590"}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g>
        <path d="M15.605 1.583C14.4.634 11.817.037 11.707.013a.375.375 0 00-.458.365c0 .506-1.038 1.125-2.25 1.125-1.21 0-2.249-.62-2.249-1.125a.375.375 0 00-.141-.293.366.366 0 00-.317-.075c-.11.024-2.69.622-3.9 1.57C1.144 2.565.788 7.313.751 7.85a.375.375 0 00.211.363 8.89 8.89 0 002.788.772v7.89c0 .138.077.265.2.33.06.033 1.533.794 5.05.794s4.989-.761 5.05-.794a.375.375 0 00.199-.33v-7.89a8.891 8.891 0 002.787-.772.375.375 0 00.212-.363c-.037-.538-.393-5.286-1.643-6.268z" />
        <path d="M4.125 9.002a.375.375 0 01-.375-.375v-2.25a3 3 0 00-.64-1.984.375.375 0 01.53-.53c.591.701.898 1.598.86 2.515v2.25a.375.375 0 01-.375.374zM13.874 9.001a.375.375 0 01-.375-.375v-2.25a3.666 3.666 0 01.86-2.514.375.375 0 11.53.53 3 3 0 00-.64 1.985v2.25a.375.375 0 01-.375.374z" />
        <path
          d="M11.863.09a.37.37 0 00-.31-.08C10.71.18 9.858.304 9 .378A22.68 22.68 0 016.446.01.375.375 0 006 .378C6 1.503 7.55 2.252 9 2.252c1.448 0 3-.75 3-1.874a.375.375 0 00-.137-.289z"
          fill={color ? color : "#2C3590"}
        />
        <path
          d="M13.874 9.001a.375.375 0 110-.75 7.45 7.45 0 002.606-.61c-.15-1.926-.624-4.91-1.337-5.468A10.633 10.633 0 0011.909.837C11.557 1.7 10.241 2.252 9 2.252c-1.24 0-2.556-.552-2.908-1.416a10.672 10.672 0 00-3.234 1.337c-.713.559-1.184 3.542-1.337 5.467a7.45 7.45 0 002.605.612.375.375 0 010 .75 8.5 8.5 0 01-3.162-.787.375.375 0 01-.212-.363c.037-.54.39-5.289 1.642-6.27A12.549 12.549 0 016.292.013a.37.37 0 01.317.076c.088.07.14.177.141.29C6.75.884 7.789 1.503 9 1.503c1.21 0 2.25-.62 2.25-1.125a.375.375 0 01.457-.365c1.38.3 2.698.83 3.9 1.57 1.251.98 1.606 5.73 1.642 6.269a.375.375 0 01-.211.363A8.5 8.5 0 0113.874 9z"
          fill={color ? borderColor.toHexString() : "#2C3590"}
        />
        <path
          d="M9 18c-3.525 0-4.99-.762-5.05-.794a.375.375 0 01-.2-.33v-10.5a3 3 0 00-.64-1.983.375.375 0 01.53-.53c.591.7.898 1.598.86 2.514v10.252c1.452.471 2.975.681 4.5.621 1.524.06 3.048-.15 4.499-.622V6.377a3.666 3.666 0 01.86-2.515.375.375 0 11.53.53 3 3 0 00-.64 1.985v10.498a.375.375 0 01-.199.33c-.06.033-1.526.795-5.05.795zM9 1.128A24.14 24.14 0 016.305.746a.375.375 0 11.14-.736C7.29.18 8.143.303 9 .378A22.81 22.81 0 0011.554.01a.375.375 0 11.14.736c-.89.178-1.79.305-2.694.382z"
          fill={color ? borderColor.toHexString() : "#2C3590"}
        />
      </g>
    </svg>
  );
};

export default ShirtIcon;
