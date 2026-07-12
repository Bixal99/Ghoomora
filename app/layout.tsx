import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { AppToasts } from "@/components/app-toasts";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "Ghoomora — Northern Pakistan, thoughtfully planned", template: "%s · Ghoomora" },
  description: "Discover destinations, compare verified local trips and build a journey across Northern Pakistan.",
  openGraph: { title: "Ghoomora", description: "Northern Pakistan, thoughtfully planned.", type: "website", images: [{ url: "/og-v2.png", width: 1731, height: 909, alt: "Ghoomora — Go beyond the postcard." }] },
  twitter: { card: "summary_large_image", title: "Ghoomora", description: "Northern Pakistan, thoughtfully planned.", images: ["/og-v2.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <AuthSessionProvider>
          {children}
          <AppToasts />
          <Toaster
            richColors
            closeButton
            position="top-center"
            duration={4500}
            toastOptions={{
              classNames: {
                toast: "font-[family-name:var(--font-poppins)] border border-primary/10 shadow-lg",
                title: "font-bold",
                description: "text-sm opacity-90",
              },
            }}
          />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
