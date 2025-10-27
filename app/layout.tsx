import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrightSteps Support | Local Services Concierge",
  description:
    "Chat with BrightSteps Support to get instant help with bookings, services, and local experts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
