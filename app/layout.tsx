import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png?v=2",
shortcut: "/favicon.png?v=2",
  },
};

export const viewport: Viewport = {
  themeColor: "#effa82",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
