import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "ConstitutionRAG — AI Legal Assistant",
  description: "Ask questions about constitutional law powered by RAG",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" style={{ height: "100%" }}>
      <body style={{ height: "100%", margin: 0, overflow: "hidden" }}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
