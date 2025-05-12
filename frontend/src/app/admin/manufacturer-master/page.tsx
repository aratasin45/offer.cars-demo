"use client";
import { useEffect, useState } from "react";
import ManufacturerForm from "./components/ManufacturerForm";
import ManufacturerTable from "./components/ManufacturerTable";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Manufacturer {
  id: number;
  name: string;
  nameEn: string;
}

export default function ManufacturerMasterPage() {
  const router = useRouter(); // ✅ 関数の中で呼ぶ
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]); // ✅ routerを依存に含める

  useEffect(() => {
    fetchManufacturers();
  }, []);

  const fetchManufacturers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`);
      const data = await res.json();
      setManufacturers(data);
    } catch (error) {
      console.error("❌ メーカー一覧取得に失敗:", error);
    }
  };

  const handleAddManufacturer = async (newManufacturer: {
    name: string;
    nameEn: string;
  }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newManufacturer),
      });

      if (res.ok) {
        fetchManufacturers();
      }
    } catch (error) {
      console.error("❌ メーカー追加エラー:", error);
    }
  };

  const handleUpdateManufacturer = async (
    id: number,
    updated: Partial<Manufacturer>
  ) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        fetchManufacturers();
      }
    } catch (error) {
      console.error("❌ メーカー更新エラー:", error);
    }
  };

  const handleDeleteManufacturer = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchManufacturers();
      }
    } catch (error) {
      console.error("❌ メーカー削除エラー:", error);
    }
  };

  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>メーカーマスタ</h2>
      <ManufacturerForm onAddManufacturer={handleAddManufacturer} />
      <ManufacturerTable
        manufacturers={manufacturers}
        onUpdate={handleUpdateManufacturer}
        onDelete={handleDeleteManufacturer}
      />
    </div>
  );
}