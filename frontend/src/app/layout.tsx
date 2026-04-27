import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "FluencyAI",
  description: "Plataforma SaaS de aprendizado de idiomas com IA",
};

const themeScript = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem("fluencyai.theme");
      const theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.style.colorScheme = "dark";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
