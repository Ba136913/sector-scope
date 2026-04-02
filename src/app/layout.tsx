import type { Metadata } from "next";
import { Inter, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-suisse",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-perfectly",
  weight: "400",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-bitcount",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "cto.new - Completely free AI code agent",
  description: "cto.new is the world's first completely free AI code agent. Use the latest frontier models from Anthropic, OpenAI and more. No credit card or API keys required.",
  openGraph: {
    title: "cto.new - Completely free AI code agent",
    description: "cto.new is the world's first completely free AI code agent. Use the latest frontier models from Anthropic, OpenAI and more. No credit card or API keys required.",
    url: "https://cto.new",
    siteName: "cto.new",
    images: [
      {
        url: "https://framerusercontent.com/images/NC6i6vDeOQTWZis14FFWERyH7s.png",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ctodotnew",
    title: "cto.new - Completely free AI code agent",
    description: "cto.new is the world's first completely free AI code agent. Use the latest frontier models from Anthropic, OpenAI and more. No credit card or API keys required.",
    images: ["https://framerusercontent.com/images/NC6i6vDeOQTWZis14FFWERyH7s.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${geistMono.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
