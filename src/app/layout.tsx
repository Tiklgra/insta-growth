import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "InstaGrowth - AI-Powered Instagram Engagement",
  description: "Generate authentic comments for your Instagram engagement strategy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen bg-gray-950 text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
// force rebuild 1771776380
