// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import HeaderLink from "@/components/HeaderLink";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/utils/ToastNotify";

export const metadata = {
    title: "Navařeno",
    description: "Recepty, které chutnají.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="cs">
        <body className="min-h-screen flex flex-col">
        <ToastProvider>
            <HeaderLink />
            <main className="flex-grow">{children}</main>
            <Footer />
        </ToastProvider>
        </body>
        </html>
    );
}
