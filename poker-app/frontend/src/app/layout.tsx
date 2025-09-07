import "./globals.css";
import React from "react";

export const metadata = {
  title: "Range vs Range Equity",
  description: "6-max equity calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}

