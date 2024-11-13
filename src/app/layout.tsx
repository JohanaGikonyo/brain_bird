import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brain Bird",
  description: "Created by JgTechnologies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" sizes="any" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" /> 
        <meta name="theme-color" content="#000000" />
        {/* <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" /> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
