"use client";
import { useEffect, useState } from "react";
import ConditionForm from "./components/ConditionForm";
import ConditionTable from "./components/ConditionTable";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Condition {
  id: number;
  label: string;
  labelEn: string;
}

export default function ConditionMasterPage() {

  const router = useRouter(); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);



  const [conditions, setConditions] = useState<Condition[]>([]);

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const res = await fetch("http://localhost:5001/conditions");
      const data = await res.json();

      if (Array.isArray(data)) {
        setConditions(data);
      } else {
        console.error("❌ 受け取ったデータが配列ではありません:", data);
        setConditions([]);
      }
    } catch (error) {
      console.error("❌ 車両状態の取得エラー:", error);
    }
  };

  // 🔹 新規追加
  const handleAddCondition = async (newCondition: { label: string; labelEn: string }) => {
    const res = await fetch("http://localhost:5001/conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCondition),
    });
    if (res.ok) {
      fetchConditions();
    }
  };

  // 🔹 編集
  const handleUpdateCondition = async (id: number, updated: Partial<Condition>) => {
    const res = await fetch(`http://localhost:5001/conditions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      fetchConditions();
    } else {
      console.error("❌ 更新に失敗しました");
    }
  };

  // 🔹 削除
  const handleDeleteCondition = async (id: number) => {
    if (!confirm("本当に削除しますか？")) return;
    const res = await fetch(`http://localhost:5001/conditions/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchConditions();
    } else {
      console.error("❌ 削除に失敗しました");
    }
  };

  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>車両状態マスタ</h2>
      <ConditionForm onAddCondition={handleAddCondition} />
      <ConditionTable
        conditions={conditions}
        onUpdateCondition={handleUpdateCondition}
        onDeleteCondition={handleDeleteCondition}
      />
      
    </div>
  );
}