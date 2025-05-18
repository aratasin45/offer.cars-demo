"use client";
import { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Manufacturer {
  id: number;
  name: string;
}

interface Condition {
  id: number;
  label: string;
  labelEn: string;
}

interface Car {
  manufacturerId: string;
  carName: string;
  carNameEn: string;
  modelCodeVin: string;
  engineModel: string;
  displacement: string;
  driveType: string;
  transmission: string;
  year: string;
  month: string;
  createdBy: string;
  rating: string;
  startPrice: string;  // 🆕 🔥追加！！
}

interface RegisteredCar extends Car {
  id: number;
  modelCode: string;
  vinNumber: string;
}

export default function CarRegisterPage() {

  const router = useRouter();

  // 👇 最初にログインチェックを追加
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
  
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
  const [formData, setFormData] = useState<Car>({
    manufacturerId: "",
    carName: "",
    carNameEn: "",
    modelCodeVin: "",
    engineModel: "",
    displacement: "",
    driveType: "2WD",
    transmission: "A/T",
    year: "",
    month: "",
    createdBy: "",
    rating: "",
    startPrice: "",  // 🆕
  });

  const [registeredCar, setRegisteredCar] = useState<RegisteredCar | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`)
      .then((res) => res.json())
      .then((data) => setManufacturers(data));

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/conditions`)
      .then((res) => res.json())
      .then((data) => setConditions(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 🔥 スタートプライスだけ半角数字のみ許可
    if (name === "startPrice") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleConditionToggle = (id: number) => {
    setSelectedConditions((prev) =>
      prev.includes(id) ? prev.filter((condId) => condId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // 🔒 二重送信防止
    setIsSubmitting(true);    // 🔓 送信開始
  
    const createdBy = localStorage.getItem("userId");
    if (!createdBy) {
      alert("ログイン情報が見つかりません。");
      setIsSubmitting(false);
      return;
    }
  
    const payload = {
      ...formData,
      createdBy: Number(createdBy),
      manufacturerId: Number(formData.manufacturerId),
      year: Number(formData.year),
      month: Number(formData.month),
      rating: Number(formData.rating),
      startPrice: Number(formData.startPrice),
    };
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (res.ok) {
      const savedCar = await res.json();
      alert("✅ 車両を登録しました");
      setRegisteredCar(savedCar);
    } else {
      alert("❌ 登録に失敗しました");
    }
  
    setIsSubmitting(false); // 🔓 処理完了後に解除
  };

  const handleEditComplete = async () => {
    if (!registeredCar) {
      alert("車両情報が見つかりません");
      return;
    }
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${registeredCar.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        manufacturerId: Number(formData.manufacturerId),
        year: Number(formData.year),
        month: Number(formData.month),
        rating: Number(formData.rating),
        createdBy: Number(formData.createdBy),
        startPrice: Number(formData.startPrice),
      }),
    });
  
    if (res.ok) {
      const updatedCar = await res.json();
      alert("✅ 編集内容を保存しました");
      setRegisteredCar(updatedCar);
      setIsEditing(false);
    } else {
      alert("❌ 編集の保存に失敗しました");
    }
  };

  const handleSaveConditions = async () => {
    if (!registeredCar) return;
  
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-conditions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carId: registeredCar.id,
        conditionIds: selectedConditions,
      }),
    });
  
    if (res.ok) {
      alert("✅ 状態を保存しました");
    } else {
      alert("❌ 状態の保存に失敗しました");
    }
  };

  
  const uploadFileToS3 = async (file: File, carId: number): Promise<boolean> => {
    try {
      const sanitizedFileName = file.name.replace(/[^\w.-]/g, "_");
      const rawFileName = `${Date.now()}_${sanitizedFileName}`;
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-images/presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: `cars/${rawFileName}`,
          contentType: file.type,
        }),
      });
  
      const { url } = await res.json();
  
      const uploadRes = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
  
      if (!uploadRes.ok) {
        console.error("PUT Error Response:", await uploadRes.text());
        return false;
      }
  
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/car-images/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId,
          imageUrl: `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/cars/${rawFileName}`,
        }),
      });
  
      return true; // ✅ 成功を返す
    } catch (err) {
      console.error("Upload Error:", err);
      return false;
    }
  };
  
  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>車両登録</h2>

      {!registeredCar && (
      <form onSubmit={handleSubmit} className="employee-form">
        <label>メーカー</label>
        <select name="manufacturerId" value={formData.manufacturerId} onChange={handleChange} required>
          <option value="">選択してください</option>
          {manufacturers.map((maker) => (
            <option key={maker.id} value={maker.id}>{maker.name}</option>
          ))}
        </select>

        <label>車名（日本語）</label>
        <input name="carName" value={formData.carName} onChange={handleChange} required />

        <label>車名（英語）</label>
        <input name="carNameEn" value={formData.carNameEn} onChange={handleChange} />

        <label>車両型式＋車体番号</label>
        <input name="modelCodeVin" value={formData.modelCodeVin} onChange={handleChange} required />

        <label>年式（西暦）</label>
        <select name="year" value={formData.year} onChange={handleChange} required>
          <option value="">選択してください</option>
          {years.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <label>月</label>
        <select name="month" value={formData.month} onChange={handleChange} required>
          <option value="">選択してください</option>
          {months.map((m) => (
            <option key={m} value={m}>{m} 月</option>
          ))}
        </select>

        <label>エンジン型式</label>
        <input name="engineModel" value={formData.engineModel} onChange={handleChange} required />

        <label>排気量</label>
        <input name="displacement" value={formData.displacement} onChange={handleChange} required />

        <label>駆動</label>
        <select name="driveType" value={formData.driveType} onChange={handleChange}>
          <option value="2WD">2WD</option>
          <option value="4WD">4WD</option>
        </select>

        <label>シフト</label>
        <select name="transmission" value={formData.transmission} onChange={handleChange}>
          <option value="A/T">A/T</option>
          <option value="M/T">M/T</option>
        </select>

        <label>総合評価</label>
        <select name="rating" value={formData.rating} onChange={handleChange} required>
          <option value="">選択してください</option>
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>

       {/* 🔥 ここがスタートプライス入力欄 */}
       <label>スタートプライス（千円単位）</label>
        <input
          name="startPrice"
          value={formData.startPrice}
          onChange={handleChange}
          pattern="[0-9]*"
          inputMode="numeric"
          placeholder="例）300 → 300,000円"
        />

       <button
         type="submit"
         className="employee-button"
         disabled={isSubmitting}
          >
          {isSubmitting ? "登録中..." : "登録"}
      </button>
      
      </form>

)}
        

      {registeredCar && (
        <div className="registered-car">
          <h3>✅ 登録済み車両</h3>
          {isEditing ? (
            <form className="edit-car-form">
            <label>メーカー</label>
            <select name="manufacturerId" value={formData.manufacturerId} onChange={handleChange} required>
              <option value="">選択してください</option>
              {manufacturers.map((maker) => (
                <option key={maker.id} value={maker.id}>
                  {maker.name}
                </option>
              ))}
            </select>
          
            <label>車名（日本語）</label>
            <input name="carName" value={formData.carName} onChange={handleChange} required />
          
            <label>車名（英語）</label>
            <input name="carNameEn" value={formData.carNameEn} onChange={handleChange} />
          
            <label>車両型式＋車体番号</label>
            <input name="modelCodeVin" value={formData.modelCodeVin} onChange={handleChange} required />
          
            <label>年式（西暦）</label>
            <select name="year" value={formData.year} onChange={handleChange} required>
              <option value="">選択してください</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          
            <label>月</label>
            <select name="month" value={formData.month} onChange={handleChange} required>
              <option value="">選択してください</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}月
                </option>
              ))}
            </select>
          
            <label>エンジン型式</label>
            <input name="engineModel" value={formData.engineModel} onChange={handleChange} required />
          
            <label>排気量</label>
            <input name="displacement" value={formData.displacement} onChange={handleChange} required />
          
            <label>駆動</label>
            <select name="driveType" value={formData.driveType} onChange={handleChange}>
              <option value="2WD">2WD</option>
              <option value="4WD">4WD</option>
            </select>
          
            <label>シフト</label>
            <select name="transmission" value={formData.transmission} onChange={handleChange}>
              <option value="A/T">A/T</option>
              <option value="M/T">M/T</option>
            </select>
          
            <label>総合評価</label>
            <select name="rating" value={formData.rating} onChange={handleChange} required>
              <option value="">選択してください</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          
            <label>スタートプライス（千円単位）</label>
            <input
              name="startPrice"
              value={formData.startPrice}
              onChange={handleChange}
              pattern="[0-9]*"
              inputMode="numeric"
              placeholder="例）300 → 300,000円"
            />
          
            <button type="button" onClick={handleEditComplete}>
              編集完了
            </button>
          </form>
          
          ) : (
            <>
              <p>メーカーID: {registeredCar.manufacturerId}</p>
              <p>車名: {registeredCar.carName}</p>
              <p>型式: {registeredCar.modelCode}</p>
              <p>車体番号: {registeredCar.vinNumber}</p>
              <p>年式: {registeredCar.year}年 {registeredCar.month}月</p>
              <p>エンジン型式: {registeredCar.engineModel}</p>
              <p>排気量: {registeredCar.displacement}</p>
              <p>駆動: {registeredCar.driveType}</p>
              <p>シフト: {registeredCar.transmission}</p>
              <p>総合評価: {registeredCar.rating}</p>

              {/* 🔥 スタートプライスも表示（カンマ付き） */}
        <p>スタートプライス: {registeredCar.startPrice ? `${registeredCar.startPrice.toLocaleString()} 千円` : "-"}</p>

              

              <button onClick={() => {
  setFormData({
    manufacturerId: registeredCar.manufacturerId.toString(),
    carName: registeredCar.carName,
    carNameEn: registeredCar.carNameEn,
    modelCodeVin: `${registeredCar.modelCode}-${registeredCar.vinNumber}`,
    engineModel: registeredCar.engineModel,
    displacement: registeredCar.displacement,
    driveType: registeredCar.driveType,
    transmission: registeredCar.transmission,
    year: registeredCar.year.toString(),
    month: registeredCar.month.toString(),
    createdBy: registeredCar.createdBy.toString(),
    rating: registeredCar.rating.toString(),
    startPrice: registeredCar.startPrice?.toString() || "", // 🔥 ここ！
  });
  setIsEditing(true);
}} className="employee-button">
  編集する
</button>
            </>
          )}
  

          {/* 状態チェックリスト */}
          <div className="condition-checklist">
            <h4>🛠️ 車両状態チェックリスト</h4>
            {conditions.map((cond) => (
              <div key={cond.id}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedConditions.includes(cond.id)}
                    onChange={() => handleConditionToggle(cond.id)}
                  />
                  {cond.label}
                </label>
              </div>
            ))}
            <button onClick={handleSaveConditions} className="employee-button">
              チェック状態を保存
            </button>
          </div>

          <div className="upload-section">
  <h4>📷 画像アップロード</h4>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      let successCount = 0;

      if (!registeredCar) {
        alert("車両情報が見つかりません");
        return;
      }
      
      const carId = registeredCar.id;
      
      for (const file of Array.from(files)) {
        const success = await uploadFileToS3(file, carId);
        if (success) successCount++;
      }

      alert(`✅ ${successCount} 枚の画像をアップロードしました`);
    }}
  />
</div>

          {/* 確認画面へ進む */}
          <button
  onClick={() => window.location.href = '/admin/car-list'}
  className="employee-button"
  style={{ marginTop: '1rem' }}
>
  確認画面へ
</button>
        </div>
      )}
    </div>

    
  );
}

