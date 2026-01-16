import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "YRIPP",
  description: "",
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-icon.png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
