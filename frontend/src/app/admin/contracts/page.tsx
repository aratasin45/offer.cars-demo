"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminHeader from "../components/AdminHeader";

type Contract = {
  id: number;
  car: {
    modelCode: string;
    vinNumber: string;
    startPrice: number | null;
    manufacturer: { name: string };
  };
  customer: {
    name: string;
    threeLetter: string;
  };
  createdBy: {
    name: string;
  };
  factoryPrice: number;
  offerPrice: number;
  profit: number;
  contractTerm: string;
  style: string;
};

export default function ContractListPage() {

  
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch failed: ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(setContracts)
      .catch((err) => {
        console.error("契約一覧取得エラー:", err);
        setError("契約データの取得に失敗しました。");
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const displayedContracts = contracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="contract-page-container">
      <AdminHeader />
      <h2>📄 成約車両一覧</h2>

      {loading ? (
        <p>📦 読み込み中です...</p>
      ) : (
        <>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <div className="contract-card-list">
            {displayedContracts.map((contract) => (
              <div key={contract.id} className="contract-card">
                <p><strong>車体:</strong> {contract.car.modelCode}-{contract.car.vinNumber}</p>
                <p><strong>メーカー:</strong> {contract.car.manufacturer.name}</p>
                <p><strong>登録者:</strong> {contract.createdBy.name}</p>
                <p><strong>スリーレター:</strong> {contract.customer.threeLetter}</p>
                <p><strong>契約条件:</strong> {contract.contractTerm}</p>
                <p><strong>スタイル:</strong> {contract.style}</p>
                <p><strong>スタート:</strong> {contract.car.startPrice} 千円</p>
                <p><strong>＠工場値:</strong> {contract.factoryPrice} 千円</p>
                <p><strong>オファー:</strong> {contract.offerPrice} 千円</p>
                <p className="profit">利益: {contract.profit} 千円</p>
              </div>
            ))}
          </div>

          {/* 🔽 ページネーション */}
          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={currentPage === index + 1 ? "active-page" : ""}
                style={{
                  margin: "0 5px",
                  padding: "6px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  backgroundColor: currentPage === index + 1 ? "#333" : "#fff",
                  color: currentPage === index + 1 ? "#fff" : "#333",
                  cursor: "pointer",
                }}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* 🔙 戻る */}
          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <button onClick={() => router.push("/admin/home")} className="back-button">
              🏠 ホームに戻る
            </button>
          </div>
        </>
      )}
    </div>
  );
}