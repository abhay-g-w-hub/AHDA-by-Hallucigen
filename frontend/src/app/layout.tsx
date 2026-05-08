import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AHDA | Fact Verification",
  description: "Autonomous Hallucination Detection Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col text-neutral-900 dark:text-neutral-200 overflow-x-hidden transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Full-screen fixed gradient background */}
          <div className="fixed inset-0 w-full h-full -z-50 bg-gradient-to-br from-amber-100 via-rose-200 to-fuchsia-300 dark:from-[#2a1310] dark:via-[#3b1227] dark:to-[#11051c] transition-colors duration-500" />
          
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
