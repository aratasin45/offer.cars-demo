"use client";
import { useEffect, useState } from "react";

export default function CustomerHeader() {
  const [threeLetter, setThreeLetter] = useState("");
  const [contractTerm, setContractTerm] = useState("");

  useEffect(() => {
    const storedThreeLetter = localStorage.getItem("threeLetter");
    const storedContractTerm = localStorage.getItem("contractTerm");

    if (storedThreeLetter) setThreeLetter(storedThreeLetter);
    if (storedContractTerm) setContractTerm(storedContractTerm);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("threeLetter");
    localStorage.removeItem("contractTerm");
    window.location.href = "/customer/login";
  };

  return (
    <div className="customer-header-wrapper">
      <div className="customer-header">
        <span>Three Letter: {threeLetter}</span>
        <span>Contract Term: {contractTerm}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}