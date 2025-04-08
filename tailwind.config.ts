import type { Config } from "tailwindcss";

const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          foreground: "var(--color-secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--color-destructive)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        card: {
          DEFAULT: "var(--color-card)",
          foreground: "var(--color-card-foreground)",
        },
        popover: {
          DEFAULT: "var(--color-popover)",
          foreground: "var(--color-popover-foreground)",
        },
        categories: {
          preparedMeals: {
            bg: "var(--color-categories-preparedMeals-bg)",
            text: "var(--color-categories-preparedMeals-text)",
          },
          clothes: {
            bg: "var(--color-categories-clothes-bg)",
            text: "var(--color-categories-clothes-text)",
          },
          fruits: {
            bg: "var(--color-categories-fruits-bg)",
            text: "var(--color-categories-fruits-text)",
          },
          vegetables: {
            bg: "var(--color-categories-vegetables-bg)",
            text: "var(--color-categories-vegetables-text)",
          },
          craftsmanship: {
            bg: "var(--color-categories-craftsmanship-bg)",
            text: "var(--color-categories-craftsmanship-text)",
          },
          bakery: {
            bg: "var(--color-categories-bakery-bg)",
            text: "var(--color-categories-bakery-text)",
          },
          coffeeShop: {
            bg: "var(--color-categories-coffeeShop-bg)",
            text: "var(--color-categories-coffeeShop-text)",
          },
          selfcare: {
            bg: "var(--color-categories-selfcare-bg)",
            text: "var(--color-categories-selfcare-text)",
          },
          alcohol: {
            bg: "var(--color-categories-alcohol-bg)",
            text: "var(--color-categories-alcohol-text)",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        nunito: ["var(--font-nunito)"],
        lato: ["var(--font-lato)"],
        inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;
