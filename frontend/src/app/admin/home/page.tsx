"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../components/AdminHeader";

export default function HomePage() {
  type UserRole = "admin" | "user";
  const [user, setUser] = useState<{ name: string; role: UserRole } | null>(null);
  const [loading, setLoading] = useState(true); // ✅ ローディング制御
  const router = useRouter();

  useEffect(() => {
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("role");
  
    if (username && (role === "admin" || role === "user")) {
      setUser({ name: username, role }); // ✅ 確実に UserRole 型
      setLoading(false);
    } else {
      router.push("/admin/login");
    }
  }, [router]);


  if (loading) return <p>Loading...</p>; // ✅ 認証確認が終わるまで何も描画しない

  return (
    <div className="home-container">
      <AdminHeader />
      <div className="home-card">
        <h2>メインメニュー</h2>
        <button className="home-card-button" onClick={() => router.push("/admin/car-register")}>
          車両登録
        </button>
        <button className="home-card-button" onClick={() => router.push("/admin/car-list")}>
          登録車両一覧
        </button>
        <button className="home-card-button" onClick={() => router.push("/admin/offers")}>
          オファー履歴
        </button>
        <button className="home-card-button" onClick={() => router.push("/admin/contracts")}>
          成約車両一覧
        </button>
      </div>

      {user?.role === "admin" && (
        <div className="home-card home-admin-card admin-visible">
          <h2>マスタ管理</h2>
          <button className="home-card-button" onClick={() => router.push("/admin/employee-master")}>
            社員マスタ
          </button>
          <button className="home-card-button" onClick={() => router.push("/admin/customer-master")}>
            顧客マスタ
          </button>
          <button className="home-card-button" onClick={() => router.push("/admin/condition-master")}>
            車両状態マスタ
          </button>
          <button className="home-card-button" onClick={() => router.push("/admin/manufacturer-master")}>
            メーカーマスタ
          </button>
        </div>
      )}
    </div>
  );
}