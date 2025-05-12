"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          employeeNumber,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error("ログインに失敗しました");
      }

      const data = await response.json();

      // 🔹 ローカルストレージに必要な情報を保存
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);


      router.push("/admin/home"); // 🔹 ホーム画面へ遷移
    } catch (error: unknown) {
      console.error("❌ ログインエラー:", error);
      setError("ログインに失敗しました。メールアドレス、社員番号、パスワードを確認してください。");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">ログイン</h2>
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="login-input-container">
            <label className="login-label">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="login-input-container">
            <label className="login-label">社員番号</label>
            <input
              type="text"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <div className="login-input-container">
            <label className="login-label">パスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="login-input"
            />
          </div>
          <button type="submit" className="login-button">
            ログイン
          </button>
        </form>
      </div>
    </div>
  );
}