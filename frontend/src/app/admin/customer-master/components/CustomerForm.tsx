"use client";
import { useState } from "react";

// 🔹 型定義をエクスポートすることで他のファイルでも再利用可能
export interface CustomerData {
  name: string;
  threeLetter: string;
  email: string;
  password: string;
  contractTerm: string;
}

export default function CustomerForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: CustomerData) => void;
  initialData?: CustomerData;
}) {
  const [formData, setFormData] = useState<CustomerData>(
    initialData ?? {
      name: "",
      threeLetter: "",
      email: "",
      password: "",
      contractTerm: "EXW",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // ✅ 正しく受け取った props を呼ぶ
    setFormData({
      name: "",
      threeLetter: "",
      email: "",
      password: "",
      contractTerm: "EXW",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <label>名前</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <label>スリーレター</label>
      <input
        type="text"
        name="threeLetter"
        value={formData.threeLetter}
        onChange={handleChange}
        required
      />

      <label>メールアドレス</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label>パスワード</label>
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <label>契約条件</label>
      <select
        name="contractTerm"
        value={formData.contractTerm}
        onChange={handleChange}
        required
      >
        <option value="EXW">EXW</option>
        <option value="FOB">FOB</option>
        <option value="C&F">C&F</option>
        <option value="CIF">CIF</option>
      </select>

      <button type="submit" className="employee-button">
        顧客を追加
      </button>
    </form>
  );
}