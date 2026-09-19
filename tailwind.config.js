/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#12181F",
          900: "#1B2430",
          800: "#26313F",
          100: "#E4E9EE",
        },
        forest: {
          50: "#EFF7F1",
          500: "#0B5D3B",
          600: "#094A30",
        },
        indigo: {
          50: "#EEF0FD",
          500: "#4F46E5",
          600: "#4338CA",
        },
        amber: {
          50: "#FFF7E8",
          500: "#C2811B",
        },
        ink: {
          900: "#1F2A24",
          400: "#7C8B92",
        },
        paper: "#F6F7F9",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
