"use client";
import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
import { useRouter } from "next/navigation";

interface Employee {
  id: number;
  name: string;
  email: string;
  employeeNumber: string;
  role: string;
}

export default function EmployeeMasterPage() {

  const router = useRouter(); // ✅ ここはOK
  type UserRole = "admin" | "user";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/admin/login");
    }
  }, [router]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newEmployee, setNewEmployee] = useState<{
    name: string;
    email: string;
    employeeNumber: string;
    role: UserRole;
    password: string;
  }>({
    name: "",
    email: "",
    employeeNumber: "",
    role: "user",
    password: "",
  });
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [updatedData, setUpdatedData] = useState<Partial<Employee>>({});

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error("社員データの取得に失敗:", error);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });

      if (!response.ok) throw new Error("社員の追加に失敗");

      setNewEmployee({ name: "", email: "", employeeNumber: "", role: "user", password: "" });
      fetchEmployees(); // 🔹 追加後に再取得
    } catch (error) {
      console.error("❌ 社員の追加エラー:", error);
    }
  };

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee);
    setUpdatedData({});
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;

    const updatedFields = Object.fromEntries(
      Object.entries(updatedData).filter(([, value]) => value !== "")
    );

    if (Object.keys(updatedFields).length === 0) {
      setEditingEmployee(null);
      return;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${editingEmployee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields),
    });

    if (response.ok) {
      fetchEmployees();
      setEditingEmployee(null);
    }
  };

  return (
    <div className="employee-container">
      <AdminHeader />
      <h2>社員マスタ</h2>

      {/* 🔹 新規社員追加フォーム */}
      <form onSubmit={handleAddEmployee} className="employee-form">
        <label>名前</label>
        <input type="text" value={newEmployee.name} onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })} required />
        <label>メール</label>
        <input type="email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} required />
        <label>社員番号</label>
        <input type="text" value={newEmployee.employeeNumber} onChange={(e) => setNewEmployee({ ...newEmployee, employeeNumber: e.target.value })} required />
        <label>パスワード</label>
        <input type="password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} required />
        <button type="submit" className="employee-button">社員を追加</button>
      </form>

      {/* 🔹 社員一覧 */}
      <table className="employee-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>メール</th>
            <th>社員番号</th>
            <th>権限</th>
            <th>編集</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.email}</td>
              <td>{emp.employeeNumber}</td>
              <td>{emp.role}</td>
              <td>
                <button className="employee-edit-button" onClick={() => handleEditClick(emp)}>
                  編集
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingEmployee && (
        <div className="employee-edit-form">
          <h3>編集: {editingEmployee.name}</h3>
          <input type="text" name="name" placeholder="新しい名前" onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })} />
          <input type="text" name="email" placeholder="新しいメール" onChange={(e) => setUpdatedData({ ...updatedData, email: e.target.value })} />
          <input type="text" name="employeeNumber" placeholder="新しい社員番号" onChange={(e) => setUpdatedData({ ...updatedData, employeeNumber: e.target.value })} />
          <input type="text" name="role" placeholder="新しい役職" onChange={(e) => setUpdatedData({ ...updatedData, role: e.target.value })} />
          <button className="employee-update-button" onClick={handleUpdate}>更新</button>
          <button className="employee-cancel-button" onClick={() => setEditingEmployee(null)}>キャンセル</button>
        </div>
      )}
    </div>
  );
}