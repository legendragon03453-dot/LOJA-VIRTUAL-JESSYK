import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JESƧYK - E-commerce Dark Luxury",
  description: "As BOLSAS que você sempre SONHOU AQUI!",
};

import { AlertModal } from "./components/AlertModal";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <AlertModal />
        {children}
      </body>
    </html>
  );
}
