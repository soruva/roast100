import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roast100 — 100 AI Critics in Seconds",
  description: "Get your website roasted by 100 AI critics. Brutal, fast, and only $5.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
