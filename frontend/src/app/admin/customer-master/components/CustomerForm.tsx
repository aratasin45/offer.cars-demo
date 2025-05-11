"use client";
import { useState } from "react";

interface CustomerFormProps {
  onAddCustomer: (customer: any) => void;
}

export default function CustomerForm({ onAddCustomer }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    threeLetter: "",
    email: "",
    password: "",
    contractTerm: "EXW", // ✅ 初期値
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddCustomer(formData);
    setFormData({
      name: "",
      threeLetter: "",
      email: "",
      password: "",
      contractTerm: "EXW", // ✅ 初期値に戻す
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