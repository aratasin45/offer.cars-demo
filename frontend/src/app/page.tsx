import "@/styles/globals.css"; // ✅ 修正: 絶対パスでインポート
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
      <main className="flex flex-col gap-8 items-center text-center">
        {/* ロゴ表示 */}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* メッセージ */}
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
          Tailwind CSS + Next.js 環境構築完了！🚀
        </h1>

        {/* ボタン */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            className="px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js ドキュメント
          </a>
          <a
            className="px-6 py-3 text-white bg-gray-600 hover:bg-gray-700 rounded-lg"
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel にデプロイ
          </a>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-12 text-gray-500">
        &copy; {new Date().getFullYear()} Your Company
      </footer>
    </div>
  );
}