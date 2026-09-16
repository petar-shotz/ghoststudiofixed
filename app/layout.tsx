import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.png?v=2",
shortcut: "/favicon.png?v=2",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ghoststudio.mk"),
  title: "Ghost Studio | Big ideas. Boo-tiful websites.",
  description: "From your first page to your next big thing. We make getting a custom website feel easy.",
  openGraph: {
    title: "Ghost Studio | Custom Websites",
    description: "From your first page to your next big thing. We make getting a custom website feel easy.",
    url: "https://ghoststudio.mk",
    siteName: "Ghost Studio",
    images: [
      {
        url: "/ghost-artist.webp",
        width: 1024,
        height: 1024,
        alt: "Ghost Studio - Custom Websites",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ghost Studio | Custom Websites",
    description: "From your first page to your next big thing. We make getting a custom website feel easy.",
    images: ["/ghost-artist.webp"],
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
