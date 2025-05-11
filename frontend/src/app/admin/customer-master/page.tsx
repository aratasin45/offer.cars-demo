"use client";
import { useEffect, useState } from "react";
import CustomerForm from "./components/CustomerForm";
import CustomerTable from "./components/CustomerTable";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";
import type { CustomerData } from "./components/CustomerForm";

interface Customer {
  id: number;
  name: string;
  threeLetter: string;
  email: string;
  contractTerm: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerMasterPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);


  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`);
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("❌ 顧客の取得に失敗:", error);
    }
  };

  const handleAddCustomer = async (newCustomer: CustomerData) =>{
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) throw new Error("顧客の追加に失敗");
      fetchCustomers();
    } catch (error) {
      console.error("❌ 顧客の追加エラー:", error);
    }
  };

  // 🔹 顧客情報を更新する
  const handleUpdateCustomer = async (id: number, updated: Partial<Customer>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) throw new Error("更新に失敗");
      fetchCustomers();
    } catch (error) {
      console.error("❌ 顧客の更新エラー:", error);
    }
  };

  // 🔹 顧客情報を削除する
  const handleDeleteCustomer = async (id: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("削除に失敗");
      fetchCustomers();
    } catch (error) {
      console.error("❌ 顧客の削除エラー:", error);
    }
  };

  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>顧客マスタ</h2>
      <CustomerForm onSubmit={handleAddCustomer} />
      <CustomerTable
        customers={customers}
        onUpdateCustomer={handleUpdateCustomer}
        onDeleteCustomer={handleDeleteCustomer} // ✅ ここがないと削除エラーになる
      />
    </div>
  );
}