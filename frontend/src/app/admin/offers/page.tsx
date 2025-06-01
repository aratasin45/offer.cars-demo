"use client";
import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Offer {
  status: string;
  id: number;
  offerPrice: number;
  style: string;
  contractTerm: string;
  car: {
    id: number;
    modelCode: string;
    vinNumber: string;
    status: string;
    createdByUser: {
      id: number;
      name: string;
    };
  };
  customer: {
    id: number;
    threeLetter: string;
    contractTerm: string;
  };
}

export default function AdminOffersPage() {

  const router = useRouter(); // ✅ ここはOK

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);



  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string>("");

  const [selectedStatus, setSelectedStatus] = useState<string>("available");
  const [selectedUserId, setSelectedUserId] = useState<string>("all");

  const [uniqueUsers, setUniqueUsers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    const r = localStorage.getItem("role");
    if (uid) setUserId(Number(uid));
    if (r) setRole(r);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/`)
      .then((res) => res.json())
      .then((data) => {
        setOffers(data);
        setFilteredOffers(data);
        const users = Array.from(
          new Map(data.map((offer: Offer) => [offer.car.createdByUser.id, offer.car.createdByUser])).values()
        ) as { id: number; name: string }[];
        setUniqueUsers(users);
      });
  }, []);

  useEffect(() => {
    const filtered = offers.filter((offer) => {
      const statusMatch = selectedStatus === "all" || offer.car.status === selectedStatus;
      const userMatch = selectedUserId === "all" || offer.car.createdByUser.id === Number(selectedUserId);
      return statusMatch && userMatch;
    });
    setFilteredOffers(filtered);
  }, [selectedStatus, selectedUserId, offers]);

  return (
    <div className="admin-container">
      <AdminHeader />
      <h2>📄 オファー一覧</h2>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <div>
          <label>ステータス: </label>
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="all">すべて</option>
            <option value="available">受付中</option>
            <option value="closed">受付終了</option>
            <option value="sold">成約済</option>
            <option value="no get">非購入</option>
          </select>
        </div>
        <div>
          <label>登録者: </label>
          <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
            <option value="all">すべて</option>
            {uniqueUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="offer-table">
        <thead>
          <tr>
            <th>車体番号</th>
            <th>担当営業</th>
            <th>スリーレター</th>
            <th>契約条件</th>
            <th>スタイル</th>
            <th>オファー金額</th>
            <th>ステータス</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {filteredOffers.map((offer) => {
            const isOwner = userId === offer.car.createdByUser.id;
            const isAdmin = role === "admin";
            const canOperate = isOwner || isAdmin;

            return (
              <tr
                key={offer.id}
                className={`row-${offer.car.status.replace(/\s/g, "-")}`} // 例: "no get" → "row-no-get"
              >
                <td>{offer.car.modelCode}-{offer.car.vinNumber}</td>
                <td>{offer.car.createdByUser.name}</td>
                <td>{offer.customer.threeLetter}</td>
                <td>{offer.customer.contractTerm}</td>
                <td>{offer.style}</td>
                <td>{offer.offerPrice.toLocaleString()},000 JPY</td>
                <td>
                  {{
                    sold: "✅ 成約済",
                    closed: "受付終了",
                    available: "受付中",
                    "no get": "非購入",
                  }[offer.car.status] ?? "-"}
                </td>
                <td>
                  {canOperate && (
                    <>
                    <button
  disabled={offer.car.status !== "closed"}
  onClick={async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${offer.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "selected" }),
    });

    if (res.ok) {
      alert("✅ 仮確定しました");
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id ? { ...o, status: "selected" } : o
        )
      );
    } else {
      alert("❌ 仮確定に失敗しました");
    }
  }}
  style={{
    backgroundColor:
      offer.status === "selected"
        ? "#ffa726" // 🟠 仮確定済み（オレンジ）
        : offer.car.status !== "closed"
        ? "#ccc" // 🚫 操作不可（グレー）
        : "#2196f3", // 🔵 操作可能（青）
    color: "white",
    cursor: offer.car.status !== "closed" ? "not-allowed" : "pointer",
  }}
>
  仮確定
</button>

    <button
      disabled={offer.status !== "selected"}
      onClick={async () => {
        const factoryPriceStr = window.prompt("＠工場値（千円）を入力してください:");
        if (!factoryPriceStr) return;

        const factoryPrice = parseInt(factoryPriceStr, 10);
        if (isNaN(factoryPrice)) {
          alert("数値を入力してください");
          return;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carId: offer.car.id,
            customerId: offer.customer.id,
            createdById: userId,
            factoryPrice,
            style: offer.style,
            offerPrice: offer.offerPrice,
            contractTerm: offer.contractTerm,
          }),
        });

        if (res.ok) {
          alert("✅ 成約が登録されました");
          setOffers((prev) =>
            prev.map((o) =>
              o.id === offer.id
                ? {
                    ...o,
                    car: { ...o.car, status: "sold" },
                    status: "sold",
                  }
                : o
            )
          );
          location.reload();
        } else {
          alert("❌ 成約登録に失敗しました");
        }
      }}
      style={{
        backgroundColor: offer.status === "selected" ? "#4caf50" : "#ccc",
        color: "white",
        cursor: offer.status === "selected" ? "pointer" : "not-allowed",
      }}
    >
      成約
    </button>

                      <button
                        onClick={async () => {
                          const confirm = window.confirm("この車両を非購入にしますか？");
                          if (!confirm) return;

                          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${offer.car.id}/noget`, {
                            method: "PATCH",
                          });

                          if (res.ok) {
                            alert("🚫 非購入に変更しました");
                            setOffers((prev) =>
                              prev.map((o) =>
                                o.id === offer.id
                                  ? {
                                      ...o,
                                      car: { ...o.car, status: "no get" },
                                    }
                                  : o
                              )
                            );
                            location.reload(); // ✅ ページリロード
                          } else {
                            alert("❌ 非購入の変更に失敗しました");
                          }
                        }}
                        style={{
                          backgroundColor: "#d32f2f",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        非購入
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="offer-card-list">
  {filteredOffers.map((offer) => {
    const isOwner = userId === offer.car.createdByUser.id;
    const isAdmin = role === "admin";
    const canOperate = isOwner || isAdmin;
    const isDisabled = offer.car.status !== "closed";

    return (
      <div key={offer.id} className="offer-card-item">
        <p><span className="offer-card-label">車体番号:</span>{offer.car.modelCode}-{offer.car.vinNumber}</p>
        <p><span className="offer-card-label">担当:</span>{offer.car.createdByUser.name}</p>
        <p><span className="offer-card-label">スリーレター:</span>{offer.customer.threeLetter}</p>
        <p><span className="offer-card-label">条件:</span>{offer.customer.contractTerm}</p>
        <p><span className="offer-card-label">スタイル:</span>{offer.style}</p>
        <p><span className="offer-card-label">金額:</span>{offer.offerPrice.toLocaleString()},000 JPY</p>
        <p><span className="offer-card-label">ステータス:</span>{{
          sold: "✅ 成約済",
          closed: "受付終了",
          available: "受付中",
          "no get": "非購入",
        }[offer.car.status] ?? "-"}</p>

        {canOperate && (
          <div className="offer-card-buttons">
            <button
  className={isDisabled ? "btn-disabled" : "btn-confirm"}
  disabled={isDisabled}
  onClick={async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/offers/${offer.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "selected" }),
    });

    if (res.ok) {
      alert("✅ 仮確定しました");
      setOffers((prev) =>
        prev.map((o) =>
          o.id === offer.id ? { ...o, status: "selected" } : o
        )
      );
    } else {
      alert("❌ 仮確定に失敗しました");
    }
  }}
  style={{
    backgroundColor:
      offer.status === "selected"
        ? "#ffa726" // 🟠 仮確定済み
        : offer.car.status !== "closed"
        ? "#ccc"
        : "#2196f3",
    color: "white",
    cursor: offer.car.status !== "closed" ? "not-allowed" : "pointer",
    marginRight: "8px",
  }}
>
  仮確定
</button>

{offer.status === "selected" && (
  <button
    className="btn-confirm"
    onClick={async () => {
      const factoryPriceStr = window.prompt("＠工場値（千円）を入力してください:");
      if (!factoryPriceStr) return;

      const factoryPrice = parseInt(factoryPriceStr, 10);
      if (isNaN(factoryPrice)) {
        alert("数値を入力してください");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: offer.car.id,
          customerId: offer.customer.id,
          createdById: userId,
          factoryPrice,
          style: offer.style,
          offerPrice: offer.offerPrice,
          contractTerm: offer.contractTerm,
        }),
      });

      if (res.ok) {
        alert("✅ 成約が登録されました");
        setOffers((prev) =>
          prev.map((o) =>
            o.id === offer.id
              ? {
                  ...o,
                  car: { ...o.car, status: "sold" },
                  status: "sold",
                }
              : o
          )
        );
        location.reload();
      } else {
        alert("❌ 成約登録に失敗しました");
      }
    }}
    style={{
      backgroundColor: "#4caf50",
      color: "white",
      cursor: "pointer",
      marginTop: "8px",
    }}
  >
    成約
  </button>
)}


            <button
              className="btn-reject"
              onClick={async () => {
                const confirm = window.confirm("この車両を非購入にしますか？");
                if (!confirm) return;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${offer.car.id}/noget`, {
                  method: "PATCH",
                });

                if (res.ok) {
                  alert("🚫 非購入に変更しました");
                  setOffers((prev) =>
                    prev.map((o) =>
                      o.id === offer.id
                        ? {
                            ...o,
                            car: { ...o.car, status: "no get" },
                          }
                        : o
                    )
                  );
                  location.reload(); // ✅ ページリロード
                } else {
                  alert("❌ 非購入の変更に失敗しました");
                }
              }}
              style={{
                backgroundColor: "#d32f2f",
                color: "white",
                cursor: "pointer",
              }}
            >
              非購入
            </button>
          </div>
        )}
      </div>
    );
  })}
</div>
    </div>
  );
}
