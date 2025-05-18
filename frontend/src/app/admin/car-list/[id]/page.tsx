"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminHeader from "../../components/AdminHeader";

interface Car {
  conditions: { conditionId: number }[];
  id: number;
  manufacturer?: { name: string };
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
  conditionIds?: number[];
  modelCodeVin?: string;
}

export default function AdminCarDetailPage() {
  const [car, setCar] = useState<Car | null>(null);
  const [editData, setEditData] = useState<EditableCar>({});
  const [hasInitializedEditData, setHasInitializedEditData] = useState(false);
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
    if (!token) router.push("/admin/login");
  }, [router]);

  const fetchCar = useCallback(async () => {
    if (!carId) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carId}`);
    const data = await res.json();
    setCar(data);
    if (data.images?.length > 0) setMainImage(data.images[0].imageUrl);
  }, [carId]);

  useEffect(() => {
    fetchCar();
  }, [fetchCar]);

  useEffect(() => {
    if (car && !hasInitializedEditData) {
      setEditData({
        carName: car.carName,
        carNameEn: car.carNameEn,
        year: car.year,
        month: car.month,
        modelCodeVin: `${car.modelCode}-${car.vinNumber}`,
        engineModel: car.engineModel,
        displacement: car.displacement,
        startPrice: car.startPrice,
        conditionIds: car.conditions.map((c) => c.conditionId),
      });
      setHasInitializedEditData(true);
    }
  }, [car, hasInitializedEditData]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conditions`)
      .then((res) => res.json())
      .then((data) => setAllConditions(data));
  }, []);

  const handleDeleteImage = async (imageId: number) => {
    if (!car) return;
    if (!window.confirm("この画像を削除しますか？")) return;

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
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
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
    setSelectedFiles([]);
    alert(`✅ ${successCount} 枚の画像をアップロードしました`);
  };

  const handleSaveEdit = async () => {
    if (!car) return;
    const { conditionIds, modelCodeVin, ...rest } = editData;

    const [modelCode, vinNumber] = (modelCodeVin ?? "").split("-");

    const sanitized = {
      ...rest,
      modelCode,
      vinNumber,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${car.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sanitized),
    });

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

      {/* メイン画像 */}
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

      {/* サムネイル */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginTop: "1rem" }}>
        {car.images.map((img) => (
          <div key={img.id}>
            <img
              src={img.imageUrl}
              alt="Thumb"
              style={{
                width: "100px",
                height: "70px",
                objectFit: "cover",
                cursor: "pointer",
                border: img.imageUrl === mainImage ? "2px solid blue" : "1px solid gray",
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
              }}
            >
              削除
            </button>
          </div>
        ))}
      </div>

      {/* 画像アップロード */}
      <div style={{ marginTop: "1rem" }}>
        <label>画像追加：</label>
        <input type="file" accept="image/*" onChange={handleFileSelect} multiple />
        <button onClick={handleUpload} className="employee-button" style={{ marginLeft: "10px" }}>
          📤 画像を保存
        </button>
      </div>

      {/* 編集フォーム */}
      <div style={{ marginTop: "1rem" }}>
        {isEditMode ? (
          <>
            <input type="text" value={editData.carName ?? ""} onChange={(e) => setEditData({ ...editData, carName: e.target.value })} placeholder="車名（日本語）" />
            <input type="text" value={editData.carNameEn ?? ""} onChange={(e) => setEditData({ ...editData, carNameEn: e.target.value })} placeholder="車名（英語）" />
            <input type="number" value={editData.year ?? car.year} onChange={(e) => setEditData({ ...editData, year: Number(e.target.value) })} />
            <input type="number" value={editData.month ?? car.month} onChange={(e) => setEditData({ ...editData, month: Number(e.target.value) })} />
            <input type="text" value={editData.modelCodeVin ?? `${car.modelCode}-${car.vinNumber}`} onChange={(e) => setEditData({ ...editData, modelCodeVin: e.target.value })} />
            <input type="text" value={editData.engineModel ?? car.engineModel} onChange={(e) => setEditData({ ...editData, engineModel: e.target.value })} />
            <input type="text" value={editData.displacement ?? car.displacement} onChange={(e) => setEditData({ ...editData, displacement: e.target.value })} />
            <input type="number" value={editData.startPrice ?? car.startPrice ?? ""} onChange={(e) => setEditData({ ...editData, startPrice: Number(e.target.value) })} />
          </>
        ) : (
          <>
            <p>{car.carName} / {car.carNameEn}</p>
            <p>{car.year}年 / {car.month}月</p>
            <p>{car.modelCode} - {car.vinNumber}</p>
            <p>{car.engineModel} / {car.displacement}cc</p>
            <p>{car.driveType} / {car.transmission}</p>
            <p>スタートプライス: {car.startPrice?.toLocaleString()},000 JPY</p>
          </>
        )}

        {/* チェックリスト */}
        {!isEditMode &&
  Array.isArray(car?.conditions) &&
  Array.isArray(allConditions) &&
  allConditions.length > 0 && (
    <div style={{ marginTop: "1rem" }}>
      <h4>Condition（登録済み）</h4>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {allConditions
          .filter((cond) =>
            car.conditions.map((c) => c.conditionId).includes(cond.id)
          )
          .map((cond) => (
            <li key={cond.id} style={{ marginBottom: "4px" }}>
              ✅ {cond.label}
            </li>
          ))}
      </ul>
    </div>

)}
        
   
  


        {/* ボタン */}
        <div style={{ marginTop: "10px" }}>
          {!isEditMode ? (
            <button onClick={() => setIsEditMode(true)} className="employee-button">✏️ 編集</button>
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
            zIndex: 1000,
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