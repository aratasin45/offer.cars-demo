"use client";
import { useState } from "react";

interface Customer {
  id: number;
  name: string;
  threeLetter: string;
  email: string;
  contractTerm: string;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  customers: Customer[];
  onUpdateCustomer: (id: number, updated: Partial<Customer>) => void;
  onDeleteCustomer: (id: number) => void;
}

export default function CustomerTable({
  customers,
  onUpdateCustomer,
  onDeleteCustomer,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<Customer>>({});

  const startEditing = (customer: Customer) => {
    setEditingId(customer.id);
    setEditedData({
      name: customer.name,
      threeLetter: customer.threeLetter,
      email: customer.email,
      contractTerm: customer.contractTerm, // ✅ 追加
    });
  };

  const handleUpdate = () => {
    if (editingId) {
      onUpdateCustomer(editingId, editedData);
      setEditingId(null);
      setEditedData({});
    }
  };

  return (
    <table className="employee-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>名前</th>
          <th>スリーレター</th>
          <th>メール</th>
          <th>契約条件</th>
          <th>追加日時</th>
          <th>変更日時</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id}>
            <td>{customer.id}</td>
            <td>
              {editingId === customer.id ? (
                <input
                  value={editedData.name || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, name: e.target.value })
                  }
                />
              ) : (
                customer.name
              )}
            </td>
            <td>
              {editingId === customer.id ? (
                <input
                  value={editedData.threeLetter || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      threeLetter: e.target.value,
                    })
                  }
                />
              ) : (
                customer.threeLetter
              )}
            </td>
            <td>
              {editingId === customer.id ? (
                <input
                  value={editedData.email || ""}
                  onChange={(e) =>
                    setEditedData({ ...editedData, email: e.target.value })
                  }
                />
              ) : (
                customer.email
              )}
            </td>

            <td>
              {editingId === customer.id ? (
                <select
                  value={editedData.contractTerm || ""}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      contractTerm: e.target.value,
                    })
                  }
                >
                  <option value="EXW">EXW</option>
                  <option value="FOB">FOB</option>
                  <option value="C&F">C&F</option>
                  <option value="CIF">CIF</option>
                </select>
              ) : (
                customer.contractTerm
              )}
            </td>

            <td>{customer.createdAt}</td>
            <td>{customer.updatedAt}</td>
            <td>
              {editingId === customer.id ? (
                <>
                  <button onClick={handleUpdate}>更新</button>
                  <button onClick={() => setEditingId(null)}>キャンセル</button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(customer)}>編集</button>
                  <button onClick={() => onDeleteCustomer(customer.id)}>削除</button>
                </>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}