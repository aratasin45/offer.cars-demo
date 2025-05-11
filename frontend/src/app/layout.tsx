import "@/styles/globals.css"; // ✅ 修正: 絶対パスでインポート

export const metadata = {
  title: "My App",
  description: "This is a sample app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans bg-white text-black dark:bg-black dark:text-white antialiased">
        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}