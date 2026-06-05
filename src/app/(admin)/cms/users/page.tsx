"use client";

// =============================================================
// User Access Page — (admin)/cms/users/page.tsx
// CRUD Pengguna Kasir (Caffeine Hub theme)
// =============================================================

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  username: string;
  role: string;
  createdAt: string;
}

export default function UserAccessPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Fetch all cashiers
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Handle Add User
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!name || !username || !password) {
      setErrorMsg("Semua field wajib diisi");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password minimal 6 karakter");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers((prev) => [data.user, ...prev]);
        setSuccessMsg(`Kasir "${name}" berhasil ditambahkan!`);
        setName("");
        setUsername("");
        setPassword("");
      } else {
        setErrorMsg(data.message || "Gagal menambahkan kasir");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan");
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Delete User
  async function handleDelete(id: string, cashierName: string) {
    if (!confirm(`Apakah Anda yakin ingin menghapus akses kasir "${cashierName}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setSuccessMsg(`Akses kasir "${cashierName}" berhasil dihapus.`);
      } else {
        const data = await res.json();
        setErrorMsg(data.message || "Gagal menghapus kasir");
      }
    } catch (err) {
      setErrorMsg("Terjadi kesalahan jaringan");
    }
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-[#fdfdfd] text-[#171717]">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">User Access</h1>
          <p className="text-sm text-gray-500">Manage cashier credentials and system access permissions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 shadow-sm font-medium">
            <span>📅 Today, {todayStr}</span>
          </div>
          <button className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 shadow-sm hover:bg-gray-50 transition-all">
            🔔
          </button>
        </div>
      </div>

      {/* ── Content Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel: Add New Cashier */}
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm h-fit">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Register New Cashier</h3>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 text-[#3f624c] text-xs font-bold rounded-xl">
              ✅ {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Budi Santoso"
                className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c] placeholder:text-gray-400"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. budi_cashier"
                className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c] placeholder:text-gray-400"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">
                Access Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-[#f9fafb] border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#3f624c] placeholder:text-gray-400"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#3f624c] hover:bg-[#324f3c] text-white py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "Registering..." : "Add Cashier"}
            </button>
          </form>
        </div>

        {/* List Panel: Cashier Accounts */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cashier Accounts</h3>
          
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading cashiers...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              No cashier accounts found. Create one using the form on the left.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100 pb-2">
                    <th className="py-2 font-semibold">NAME</th>
                    <th className="py-2 font-semibold">USERNAME</th>
                    <th className="py-2 font-semibold">ROLE</th>
                    <th className="py-2 font-semibold">CREATED DATE</th>
                    <th className="py-2 font-semibold text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 font-bold text-gray-900 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[#3f624c] text-xs">
                          {u.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        {u.name}
                      </td>
                      <td className="py-3 text-gray-500 font-medium">@{u.username}</td>
                      <td className="py-3">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-green-50 text-[#3f624c] rounded-full border border-green-100 capitalize">
                          {u.role.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => handleDelete(u.id, u.name)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 transition-all"
                          title="Hapus Akun Kasir"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
