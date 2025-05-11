// components/AdminHeader.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminHeader() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/admin/login");
  };

  const handleGoHome = () => {
    router.push("/admin/home"); // ← あなたのホーム画面URLに変更
  };

  return (
    <div className="customer-header-wrapper">
      <div className="customer-header">
        <span>ログイン中: {username}</span>
        <button onClick={handleGoHome} style={{ marginLeft: "1rem" }}>ホーム画面</button>
        <button onClick={handleLogout} style={{ marginLeft: "1rem" }}>ログアウト</button>
      </div>
    </div>
  );
}