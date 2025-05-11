// src/app/admin/manufacturer-master/components/ManufacturerForm.tsx
"use client";
import { useState } from "react";

interface Props {
  onAddManufacturer: (manufacturer: { name: string; nameEn: string }) => Promise<void>;
}

export default function ManufacturerForm({ onAddManufacturer }: Props) {
  const [form, setForm] = useState({ name: "", nameEn: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.nameEn) return;

    try {
      await onAddManufacturer(form);
      setForm({ name: "", nameEn: "" });
    } catch (error) {
      console.error("🚨 メーカー追加エラー:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <input
        type="text"
        placeholder="メーカー名（日本語）"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="メーカー名（英語）"
        value={form.nameEn}
        onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
        required
      />
      <button type="submit" className="employee-button">
        メーカーを追加
      </button>
    </form>
  );
}