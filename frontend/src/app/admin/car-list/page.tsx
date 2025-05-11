"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminHeader from "../components/AdminHeader";

interface Car {
  id: number;
  manufacturer: { name: string };
  carName: string;
  carNameEn: string;
  modelCode: string;
  vinNumber: string;
  engineModel: string;
  displacement: string;
  driveType: string;
  transmission: string;
  year: number;
  month: number;
  createdByUser: { name: string };
  status: string;
  images: { imageUrl: string }[];
  createdAt: string;
  startPrice?: number;
}

export default function CarListPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // ✅ ログイン判定中
  const router = useRouter();

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setCars(data.data);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page]);

  const filteredCars = cars
    .filter((car) => car.status !== "sold" && car.status !== "no get")
    .filter((car) =>
      car.carName.toLowerCase().includes(search.toLowerCase()) ||
      car.modelCode.toLowerCase().includes(search.toLowerCase())
    );

  const handleStatusChange = async (carId: number, newStatus: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (res.ok) {
      alert("✅ ステータスを更新しました");
      setCars((prev) =>
        prev.map((car) =>
          car.id === carId ? { ...car, status: newStatus } : car
        )
      );
    } else {
      alert("❌ ステータス更新に失敗しました");
    }
  };

  if (loading) return <p>Loading...</p>; // ✅ ログイン確認が終わるまで表示しない

  return (
    <div className="car-list-container">
      <AdminHeader />
      <h2>🚗 登録車両一覧</h2>

      <input
        type="text"
        placeholder="検索: 車名や型式"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="sort-controls">
        <label>ソート:</label>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
          <option value="createdAt">登録日</option>
          <option value="year">年式</option>
        </select>
      </div>

      <div className="car-list">
        {filteredCars
          .sort((a, b) => {
            if (sortKey === "year") return b.year - a.year;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          })
          .map((car) => (
            <div key={car.id} className="car-card">
              <img
                src={car.images[0]?.imageUrl || "/no-image.png"}
                alt="サムネイル"
                className="car-thumbnail"
                onError={(e) => (e.currentTarget.src = "/no-image.png")}
              />
              <div className="car-details">
                <p>{car.year}年 {car.month}月</p>
                <p>{car.manufacturer.name} / {car.carName} ({car.carNameEn})</p>
                <p>{car.modelCode} - {car.vinNumber}</p>
                <p>エンジン: {car.engineModel} / {car.displacement}cc</p>
                <p>{car.driveType} / {car.transmission}</p>
                <p>登録者: {car.createdByUser.name}</p>
                <p>スタートプライス: {car.startPrice ? `${car.startPrice.toLocaleString()} 千円` : "-"}</p>
              </div>

              <div className="car-actions">
                <label>ステータス:
                  <select
                    value={car.status}
                    onChange={(e) => handleStatusChange(car.id, e.target.value)}
                  >
                    <option value="available">Available（表示中）</option>
                    <option value="closed">Closed（締切）</option>
                  </select>
                </label>
                <Link href={`/admin/car-list/${car.id}`}>
                  <button className="car-view-button" style={{ marginTop: "8px" }}>
                    編集＞
                  </button>
                </Link>
              </div>
            </div>
          ))}
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx}
            onClick={() => setPage(idx + 1)}
            className={page === idx + 1 ? "active-page" : ""}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      <button onClick={() => window.history.back()} className="employee-button">🔙 戻る</button>
    </div>
  );
}