"use client";
import { useState } from "react";

interface Condition {
  id: number;
  label: string;
  labelEn: string;
}

interface Props {
  conditions: Condition[];
  onUpdateCondition: (id: number, data: Partial<Condition>) => void;
  onDeleteCondition: (id: number) => void;
}

export default function ConditionTable({ conditions, onUpdateCondition, onDeleteCondition }: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [edited, setEdited] = useState<Partial<Condition>>({});

  const handleEdit = (condition: Condition) => {
    setEditingId(condition.id);
    setEdited({ label: condition.label, labelEn: condition.labelEn });
  };

  const handleUpdate = () => {
    if (editingId !== null) {
      onUpdateCondition(editingId, edited);
      setEditingId(null);
      setEdited({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEdited({});
  };

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>日本語ラベル</th>
          <th>英語ラベル</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {conditions.map((condition) => (
          <tr key={condition.id}>
            <td>{condition.id}</td>
            <td>
              {editingId === condition.id ? (
                <input
                  value={edited.label || ""}
                  onChange={(e) => setEdited({ ...edited, label: e.target.value })}
                />
              ) : (
                condition.label
              )}
            </td>
            <td>
              {editingId === condition.id ? (
                <input
                  value={edited.labelEn || ""}
                  onChange={(e) => setEdited({ ...edited, labelEn: e.target.value })}
                />
              ) : (
                condition.labelEn
              )}
            </td>
            <td>
              {editingId === condition.id ? (
                <>
                  <button className="employee-update-button" onClick={handleUpdate}>更新</button>
                  <button className="employee-cancel-button" onClick={handleCancel}>キャンセル</button>
                </>
              ) : (
                <>
                  <button className="employee-edit-button" onClick={() => handleEdit(condition)}>編集</button>
                  <button className="employee-cancel-button" onClick={() => onDeleteCondition(condition.id)}>削除</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}