// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import HeaderLink from "@/components/HeaderLink";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/utils/ToastNotify";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Head from "next/head";

export const metadata = {
    title: "Navařeno",
    description: "Recepty, které chutnají.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="cs">
        <Head>
            <meta name="keywords" content="recepty, vaření, jídlo, kuchyně, dezerty, hlavní chody, polévky, saláty, předkrmy, nápoje" />
            <meta property="og:title" content="Navařeno" />
            <meta property="og:description" content="Recepty, které chutnají." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://navareno.vercel.app/" />
            <meta property="og:image" content="https://navareno.vercel.app/images/hero.jpg" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Navařeno" />
            <meta name="twitter:description" content="Recepty, které chutnají." />
            <meta name="twitter:image" content="https://navareno.vercel.app/images/hero.jpg" />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: `{
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Navařeno",
                "url": "https://navareno.vercel.app/",
                "description": "Recepty, které chutnají."
            }` }} />
        </Head>
        <body className="min-h-screen flex flex-col">
        <ToastProvider>
            <SessionProviderWrapper>
                <HeaderLink />
                <main className="flex-grow">{children}</main>
                <Footer />
            </SessionProviderWrapper>
        </ToastProvider>
        </body>
        </html>
    );
}
