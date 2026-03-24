import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BillBrain Home",
  description: "AI utility anomaly detective for one home.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
