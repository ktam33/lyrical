import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cantonese Lyrics Translator",
  description: "Translate Cantonese song lyrics and discover new characters",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}