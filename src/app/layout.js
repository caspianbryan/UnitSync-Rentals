import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { RedirectHandler } from "@/components/Authhandler/RedirectHandler";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "UnitSync",
  description: "Premium Property Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <RedirectHandler>
              {children}
            </RedirectHandler>
            <Toaster position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}