"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerHeader() {
  const [threeLetter, setThreeLetter] = useState<string | null>(null);
  const [contractTerm, setContractTerm] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setThreeLetter(localStorage.getItem("threeLetter"));
    setContractTerm(localStorage.getItem("contractTerm"));
  }, []);

  const handleLogout = () => {
    localStorage.clear(); // 🔁 まとめて削除（必要なら個別でもOK）
    router.push("/customer/login");
  };

  return (
    <div className="customer-header-wrapper">
      <div className="customer-header">
        <span>Three Letter: {threeLetter ?? "-"}</span>
        <span>Contract Term: {contractTerm ?? "-"}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}