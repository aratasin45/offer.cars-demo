"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [threeLetter, setThreeLetter] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/customer-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, threeLetter, password }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("userId", data.userId.toString());
      localStorage.setItem("username", data.username);
      localStorage.setItem("role", data.role);
      localStorage.setItem("threeLetter", data.threeLetter);       // ← スリーレター保存
      localStorage.setItem("contractTerm", data.contractTerm);     // ← 契約条件保存
      

      router.push("/customer/cars"); // 🔹 オファー車一覧ページへ遷移
    } catch (err) {
      console.error("Login Error:", err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Customer Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="login-input" />

          <label>Three Letter Code</label>
          <input type="text" value={threeLetter} onChange={(e) => setThreeLetter(e.target.value)} required className="login-input" />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="login-input" />

          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
}