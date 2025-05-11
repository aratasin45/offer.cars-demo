"use client";
import { useState } from "react";

interface Manufacturer {
  id: number;
  name: string;
  nameEn: string;
}

interface Props {
  manufacturers: Manufacturer[];
  onUpdate: (id: number, updated: Partial<Manufacturer>) => void;
  onDelete: (id: number) => void;
}

export default function ManufacturerTable({
  manufacturers,
  onUpdate,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<Manufacturer>>({});

  const startEditing = (manufacturer: Manufacturer) => {
    setEditingId(manufacturer.id);
    setEditedData({
      name: manufacturer.name,
      nameEn: manufacturer.nameEn,
    });
  };

  const handleUpdate = () => {
    if (editingId !== null) {
      onUpdate(editingId, editedData);
      setEditingId(null);
      setEditedData({});
    }
  };

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>メーカー名（日本語）</th>
          <th>メーカー名（英語）</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {manufacturers.map((maker) => (
          <tr key={maker.id}>
            <td>{maker.id}</td>
            <td>
              {editingId === maker.id ? (
                <input
                  value={editedData.name || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                />
              ) : (
                maker.name
              )}
            </td>
            <td>
              {editingId === maker.id ? (
                <input
                  value={editedData.nameEn || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, nameEn: e.target.value })
                  }
                />
              ) : (
                maker.nameEn
              )}
            </td>
            <td>
              {editingId === maker.id ? (
                <>
                  <button
                    className="employee-update-button"
                    onClick={handleUpdate}
                  >
                    更新
                  </button>
                  <button
                    className="employee-cancel-button"
                    onClick={() => setEditingId(null)}
                  >
                    キャンセル
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="employee-edit-button"
                    onClick={() => startEditing(maker)}
                  >
                    編集
                  </button>
                  <button
                    className="employee-cancel-button"
                    onClick={() => onDelete(maker.id)}
                  >
                    削除
                  </button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}