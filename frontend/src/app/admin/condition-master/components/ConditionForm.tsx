"use client";
import { useState } from "react";

interface Props {
  onAddCondition: (newCondition: { label: string; labelEn: string }) => void;
}

export default function ConditionForm({ onAddCondition }: Props) {
  const [label, setLabel] = useState("");
  const [labelEn, setLabelEn] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !labelEn) return;
    onAddCondition({ label, labelEn });
    setLabel("");
    setLabelEn("");
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <input
        type="text"
        placeholder="車両状態（日本語）"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="車両状態（英語）"
        value={labelEn}
        onChange={(e) => setLabelEn(e.target.value)}
        required
      />
      <button type="submit" className="employee-button">追加</button>
    </form>
  );
}