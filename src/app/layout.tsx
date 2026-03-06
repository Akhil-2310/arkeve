import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ArkEve — Events, Owned by You | Decentralized Event Platform",
  description:
    "Discover and host events on a decentralized platform powered by Arkiv Network. Organizers and attendees own their data — no middlemen, no lock-in.",
  keywords: ["events", "web3", "decentralized", "arkiv", "blockchain", "RSVP"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main style={{ minHeight: "calc(100vh - 80px)" }}>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
