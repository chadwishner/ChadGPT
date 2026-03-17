import "./globals.css";

export const metadata = {
  title: "ChadGPT",
  description: "Talk directly to Chad. No AI, just vibes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
