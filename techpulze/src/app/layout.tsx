import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechPulze - Ethical Tech News & Company Analysis",
  description: "Discover tech companies with ethical practices, track their impact, and stay informed with curated tech news. TechPulze helps you make informed decisions about the technology you support.",
  keywords: ["tech news", "ethical technology", "company ethics", "tech analysis", "sustainability", "AI ethics"],
  authors: [{ name: "TechPulze" }],
  openGraph: {
    title: "TechPulze - Ethical Tech News & Company Analysis",
    description: "Track ethical practices and impact scores of tech companies",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f9fafb" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
