import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Ghoomora — Northern Pakistan, thoughtfully planned", template: "%s · Ghoomora" },
  description: "Discover destinations, compare verified local trips and build a journey across Northern Pakistan.",
  openGraph: { title: "Ghoomora", description: "Northern Pakistan, thoughtfully planned.", type: "website", images: [{ url: "/hero-bg.svg", width: 1200, height: 630, alt: "Ghoomora — Northern Pakistan, thoughtfully planned." }] },
  twitter: { card: "summary_large_image", title: "Ghoomora", description: "Northern Pakistan, thoughtfully planned.", images: ["/hero-bg.svg"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkProvider>{children}</ClerkProvider> : children}</body>
    </html>
  );
}
