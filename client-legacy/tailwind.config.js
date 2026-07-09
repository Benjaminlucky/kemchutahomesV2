// tailwind.config.js
export default {
  content: [
    "./index.html", // Include the root HTML file
    "./src/**/*.{js,jsx,ts,tsx,html}", // Include all source files
  ],
  theme: {
    extend: {
      colors: {
        customPurple: {
          DEFAULT: "#700CEB", // Base Color
          50: "#EFC2FF", // Lightest tint
          100: "#D6A1FB",
          200: "#BD80F8",
          300: "#A35FF4",
          400: "#8A2FF0",
          500: "#700CEB", // Base color
          600: "#6413D4",
          700: "#5711BE",
          800: "#4B0FA7",
          900: "#3F0C91", // Darkest tone
        },
        customBlack: {
          50: "#f5f5f5", // Very light gray
          100: "#e5e5e5", // Light gray
          200: "#d4d4d4", // Lighter gray
          300: "#a3a3a3", // Medium-light gray
          400: "#737373", // Medium gray
          500: "#525252", // Dark gray
          600: "#404040", // Darker gray
          700: "#262626", // Very dark gray
          800: "#171717", // Almost black
          900: "#000000", // Pure black
        },
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        ":root": {
          "--color-customPurple-50": theme("colors.customPurple.50"),
          "--color-customPurple-100": theme("colors.customPurple.100"),
          "--color-customPurple-200": theme("colors.customPurple.200"),
          "--color-customPurple-300": theme("colors.customPurple.300"),
          "--color-customPurple-400": theme("colors.customPurple.400"),
          "--color-customPurple-500": theme("colors.customPurple.500"),
          "--color-customPurple-600": theme("colors.customPurple.600"),
          "--color-customPurple-700": theme("colors.customPurple.700"),
          "--color-customPurple-800": theme("colors.customPurple.800"),
          "--color-customPurple-900": theme("colors.customPurple.900"),
        },
      });
    },
  ],
};
