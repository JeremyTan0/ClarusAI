'use client';

import Link from "next/link";
import { useState } from "react";

export default function LoginRoute() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/api/users/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      return;
    }

    console.log("Login successful");
  };

  return (
  <div className="flex items-center justify-center font-sans">
    <main className="bg-white p-4 rounded-md">
      <h1 className="text-2xl font-bold text-black">Login Route</h1>
      <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-md">
        <label htmlFor="email" className="block m-2 text-black">Email: </label>
        <input type="text" id="email" name="email" className="text-black border border-gray-300 rounded-md p-2" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label htmlFor="password" className="block m-2 text-black">Password: </label>
        <input type="password" id="password" name="password" className="text-black border border-gray-300 rounded-md p-2" required />

        <button type="submit"  className="block  text-black border border-gray-300 rounded-md p-2">Submit</button>
      </form>
      <Link href="/signup" className="text-blue-500 underline mt-4 block">
        Don't have an account? SignUp
      </Link>
    </main>
  </div>
  );
}