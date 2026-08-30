import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AccentThemeProvider } from "@/components/accent-theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "BidLens — AI-Powered Proposal Generation",
  description:
    "Analyze job postings, match your skills, and generate winning proposals with AI. Built for freelancers on Upwork, Fiverr, and beyond.",
  icons: {
    icon: [
      { url: "/logo.png", href: "/logo.png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  keywords: [
    "proposal generation",
    "freelancer tools",
    "AI proposals",
    "Upwork",
    "Fiverr",
    "job analysis",
    "cover letter generator",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AccentThemeProvider>
            <AuthProvider>
              <TooltipProvider delay={0}>
                {children}
                <Toaster
                  position="bottom-right"
                  toastOptions={{
                    className: "border-border bg-card text-card-foreground",
                  }}
                />
              </TooltipProvider>
            </AuthProvider>
          </AccentThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
