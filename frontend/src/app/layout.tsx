import { Inter } from "next/font/google";
// TypeScript may complain about missing type declarations for CSS imports in this project setup.
// Suppress the error for this side-effect import.
// @ts-ignore
import "./globals.css"; // or wherever your global CSS is imported

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased dark bg-[#030712] text-white">
        {children}
      </body>
    </html>
  );
}