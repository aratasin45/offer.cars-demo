"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";

interface Car {
  conditionIds: number[];
  id: number;
  manufacturer?: { name: string }; // ← manufacturerをoptionalに変更
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
  startPrice?: number;
  images: { id: number; imageUrl: string }[];
  
}

interface EditableCar extends Partial<Car> {
  conditionIds?: number[]; // ← `?` を追加、型も `number[]` にして明確に
  modelCodeVin?: string;
}

export default function AdminCarDetailPage() {

  


  const [car, setCar] = useState<Car | null>(null);
  const [editData, setEditData] = useState<EditableCar>({
    conditionIds: [],
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const carId = params?.id as string;
  const [allConditions, setAllConditions] = useState<{ id: number; label: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const fetchCar = useCallback(async () => {
    if (!carId) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carId}`);
    const data = await res.json();
    setCar(data);
    if (data.images?.length > 0) {
      setMainImage(data.images[0].imageUrl);
    }
  }, [carId]); // 🔸 carId を依存に含める

  useEffect(() => {
    if (car) {
      setEditData((prev) => ({
        ...prev,
        conditionIds: car.conditionIds,
      }));
    }
  }, [car]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conditions`)
      .then(res => res.json())
      .then(data => setAllConditions(data));
  }, []);
  
  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  const handleDeleteImage = async (imageId: number) => {
    if (!car) return;
    const confirm = window.confirm("この画像を削除しますか？");
    if (!confirm) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-images/${imageId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      const updatedImages = car.images.filter((img) => img.id !== imageId);
      setCar({ ...car, images: updatedImages });
      setMainImage(updatedImages[0]?.imageUrl ?? null);
    } else {
      alert("❌ 画像の削除に失敗しました");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setSelectedFiles(Array.from(files));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length || !car) return;
  
    let successCount = 0;
  
    for (const file of selectedFiles) {
      const fileKey = `cars/${Date.now()}_${file.name}`;
      const presignRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/s3/presign?filename=${encodeURIComponent(fileKey)}&contentType=${file.type}`
      );
      const { url } = await presignRes.json();
  
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
  
      if (uploadRes.ok) {
        const imageUrl = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${fileKey}`;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-images/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carId: car.id, imageUrl }),
        });
        successCount++;
      }
    }
  
    await fetchCar();
    setSelectedFiles([]); // ← クリア
    alert(`✅ ${successCount} 枚の画像をアップロードしました`);
  };
  const handleSaveEdit = async () => {
    if (!car) return;
  
    const { conditionIds, ...rest } = editData;
  
    const sanitized = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined && v !== null)
    );
  
    // 🔹 PATCHでcarの基本情報を更新
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });
  
    // 🔹 条件があれば状態（CarCondition）も更新
    if (res.ok && conditionIds) {
      const condRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-conditions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          conditionIds,
        }),
      });
  
      if (condRes.ok) {
        await fetchCar();
        setIsEditMode(false);
        alert("✅ 情報と状態を更新しました");
      } else {
        alert("❌ 状態の更新に失敗しました");
      }
    } else if (res.ok) {
      await fetchCar();
      setIsEditMode(false);
      alert("✅ 情報を更新しました");
    } else {
      alert("❌ 更新に失敗しました");
    }
  };

  if (!car) return <p>Loading...</p>;

  return (
    <div className="car-list-container">
      <AdminHeader />
      <h2>🚗 {car.manufacturer?.name ?? "メーカー不明"} / {car.carName}</h2>

      {mainImage && (
        <div style={{ marginBottom: "10px" }}>
          <img
            src={mainImage}
            alt="Main"
            style={{ width: "100%", maxHeight: "400px", objectFit: "contain" }}
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      )}

{/* サムネイル画像 横並びに修正 */}
<div
  style={{
    display: "flex",
    gap: "10px",
    overflowX: "auto",
    marginTop: "1rem",
    paddingBottom: "0.5rem",
    scrollSnapType: "x mandatory",
  }}
>
  {car.images.map((img) => (
    <div key={img.id} style={{ flex: "0 0 auto", textAlign: "center" }}>
      <img
        src={img.imageUrl}
        alt="Thumb"
        style={{
          width: "100px",
          height: "70px",
          objectFit: "cover",
          cursor: "pointer",
          border: img.imageUrl === mainImage ? "2px solid blue" : "1px solid gray",
          scrollSnapAlign: "start",
          borderRadius: "6px",
        }}
        onClick={() => setMainImage(img.imageUrl)}
      />
      <button
        onClick={() => handleDeleteImage(img.id)}
        style={{
          marginTop: "4px",
          backgroundColor: "#d32f2f",
          color: "white",
          border: "none",
          borderRadius: "4px",
          padding: "2px 6px",
          cursor: "pointer",
        }}
      >
        削除
      </button>
    </div>
  ))}
</div>

<div style={{ marginTop: "1rem" }}>
  <label>画像追加：</label>
  <input type="file" accept="image/*" onChange={handleFileSelect} multiple />

  <button
    onClick={handleUpload}
    className="employee-button"
    style={{ marginLeft: "10px" }}
    disabled={!selectedFiles} // 選択されてないときは無効化
  >
    📤 画像を保存
  </button>
</div>

      <div style={{ marginTop: "1rem" }}>
        {isEditMode ? (
          <>
            <div>
              <label>年：</label>
              <input
                type="number"
                value={editData.year ?? car.year}
                onChange={(e) => setEditData({ ...editData, year: Number(e.target.value) })}
              />
            </div>
            <div>
              <label>月：</label>
              <input
                type="number"
                value={editData.month ?? car.month}
                onChange={(e) => setEditData({ ...editData, month: Number(e.target.value) })}
              />
            </div>
            <div>
              <label>型式-車体番号：</label>
              <input
                type="text"
                value={editData.modelCodeVin ?? `${car.modelCode}-${car.vinNumber}`}
                onChange={(e) => setEditData({ ...editData, modelCodeVin: e.target.value })}
              />
            </div>
            <div>
              <label>エンジン型式：</label>
              <input
                type="text"
                value={editData.engineModel ?? car.engineModel}
                onChange={(e) => setEditData({ ...editData, engineModel: e.target.value })}
              />
            </div>
            <div>
              <label>排気量：</label>
              <input
                type="text"
                value={editData.displacement ?? car.displacement}
                onChange={(e) => setEditData({ ...editData, displacement: e.target.value })}
              />
            </div>
            <div>
              <label>スタートプライス：</label>
              <input
                type="number"
                value={editData.startPrice ?? car.startPrice ?? ""}
                onChange={(e) => setEditData({ ...editData, startPrice: Number(e.target.value) })}
              />
            </div>
          </>
        ) : (
          <>
            <p>{car.year}年 / {car.month}月</p>
            <p>{car.modelCode} - {car.vinNumber}</p>
            <p>エンジン: {car.engineModel} / {car.displacement}cc</p>
            <p>{car.driveType} / {car.transmission}</p>
            <p>スタートプライス: {car.startPrice?.toLocaleString()},000 JPY</p>
          </>
        )}

<div>
  <label>車両状態：</label>
  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "0.5rem" }}>
    {allConditions.map((cond) => (
      <label key={cond.id}>
        <input
          type="checkbox"
          checked={(editData.conditionIds ?? car.conditionIds ?? []).includes(cond.id)}
          onChange={(e) => {
            const current = editData.conditionIds ?? car.conditionIds ?? [];
            const updated = e.target.checked
              ? [...current, cond.id]
              : current.filter((id) => id !== cond.id);
            setEditData({ ...editData, conditionIds: updated });
          }}
        />
        {cond.label}
      </label>
    ))}
  </div>
</div>

        <div style={{ marginTop: "10px" }}>
          {!isEditMode ? (
            <button onClick={() => {
              setEditData({
                ...car,
                modelCodeVin: `${car.modelCode}-${car.vinNumber}`,
                conditionIds: car.conditionIds,
              });
              setIsEditMode(true);
            }} className="employee-button">
              ✏️ 編集
            </button>
          ) : (
            <>
              <button onClick={handleSaveEdit} className="employee-button">💾 保存</button>
              <button onClick={() => setIsEditMode(false)} className="employee-button">❌ キャンセル</button>
            </>
          )}
        </div>
      </div>

      <button onClick={() => router.back()} className="employee-button">🔙 戻る</button>

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <img
            src={mainImage ?? ""}
            alt="Zoom"
            style={{ maxWidth: "90%", maxHeight: "90%", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}