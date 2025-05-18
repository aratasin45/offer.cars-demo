"use client";
import { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Manufacturer {
  id: number;
  name: string;
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
  startPrice: string;
}

export default function CarRegisterPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
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
    startPrice: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/manufacturers`)
      .then((res) => res.json())
      .then((data) => setManufacturers(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "startPrice") {
      const onlyNumbers = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyNumbers }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

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

      // ✅ 編集画面へ遷移
      router.push(`/admin/car-list/${savedCar.id}`);
    } else {
      alert("❌ 登録に失敗しました");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>車両登録</h2>

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
    </div>
  );
}