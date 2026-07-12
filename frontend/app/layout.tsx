import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Washington Laundry | Premium Laundry & Dry Cleaning",
  description: "Professional laundry and dry cleaning service. Schedule a pickup and get fresh, clean clothes delivered to your doorstep.",
};

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} h-full antialiased`}
    >
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
            darkMode: "class",
            theme: {
              extend: {
                colors: {
                  "outline": "#6e7980",
                  "background": "#f7f9fb",
                  "secondary-container": "#93bdff",
                  "surface-container": "#eceef0",
                  "on-tertiary-container": "#711c00",
                  "surface-container-high": "#e6e8ea",
                  "surface-container-highest": "#e0e3e5",
                  "inverse-primary": "#77d1ff",
                  "on-tertiary": "#ffffff",
                  "on-surface-variant": "#3e484f",
                  "on-tertiary-fixed-variant": "#862300",
                  "surface-container-low": "#f2f4f6",
                  "secondary-fixed": "#d5e3ff",
                  "primary-container": "#2bb1e7",
                  "on-error-container": "#93000a",
                  "primary": "#006689",
                  "on-primary": "#ffffff",
                  "on-secondary-container": "#194b86",
                  "surface": "#f7f9fb",
                  "on-background": "#191c1e",
                  "on-error": "#ffffff",
                  "on-primary-container": "#004057",
                  "secondary": "#325f9b",
                  "on-primary-fixed-variant": "#004d68",
                  "tertiary": "#af3100",
                  "primary-fixed-dim": "#77d1ff",
                  "on-secondary-fixed-variant": "#124782",
                  "tertiary-container": "#ff815a",
                  "surface-bright": "#f7f9fb",
                  "surface-container-lowest": "#ffffff",
                  "on-secondary-fixed": "#001c3b",
                  "inverse-on-surface": "#eff1f3",
                  "surface-variant": "#e0e3e5",
                  "surface-dim": "#d8dadc",
                  "tertiary-fixed": "#ffdbd1",
                  "outline-variant": "#bdc8d0",
                  "on-primary-fixed": "#001e2c",
                  "on-tertiary-fixed": "#3a0a00",
                  "inverse-surface": "#2d3133",
                  "error": "#ba1a1a",
                  "on-secondary": "#ffffff",
                  "primary-fixed": "#c2e8ff",
                  "tertiary-fixed-dim": "#ffb59f",
                  "error-container": "#ffdad6",
                  "surface-tint": "#006689",
                  "on-surface": "#191c1e",
                  "secondary-fixed-dim": "#a7c8ff",
                  "accent-gold": "#ff815a"
                },
                fontFamily: {
                  'display-lg': ['Hanken Grotesk', 'sans-serif'],
                  'label-sm': ['Hanken Grotesk', 'sans-serif'],
                  'body-lg': ['Hanken Grotesk', 'sans-serif'],
                  'title-md': ['Hanken Grotesk', 'sans-serif'],
                  'headline-lg': ['Hanken Grotesk', 'sans-serif'],
                  'label-md': ['Hanken Grotesk', 'sans-serif'],
                  'body-md': ['Hanken Grotesk', 'sans-serif']
                },
                spacing: {
                  'section-padding-desktop': '80px',
                }
              }
            }
          }
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
