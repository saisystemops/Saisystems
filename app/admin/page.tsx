"use client";
import React, { useState, useEffect } from "react";
import {
  Laptop,
  Monitor,
  Cctv,
  Wrench,
  Headphones,
  Inbox,
  Lock,
  Plus,
  Trash,
  Save,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle,
  Phone,
  MessageCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import type { Product } from "@/lib/data/default-products";

type DBStatus = {
  productsTable: "ready" | "missing";
  adminUsersTable: "ready" | "missing";
};

type Ticket = {
  id: string;
  ticket_ref: string;
  title: string;
  description: string;
  customer_name: string | null;
  customer_contact_phone: string | null;
  category: string;
  priority: string;
  status: string;
  site_city: string;
  created_at: string;
};

type SidebarSection = "all" | "laptops" | "desktops" | "cctv" | "spare-parts" | "accessories" | "tickets";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Layout navigation & search
  const [activeSection, setActiveSection] = useState<SidebarSection>("all");
  const [searchText, setSearchText] = useState("");

  // Raw states loaded from API
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatus>({ productsTable: "missing", adminUsersTable: "missing" });
  const [fetchingData, setFetchingData] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});
  
  // Add item state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    id: "",
    category: "laptops",
    title: "",
    description: "",
    price: "",
    originalPrice: "",
    badge: "",
    specs: [],
    inStock: true
  });
  const [newSpecText, setNewSpecText] = useState("");

  // Check auth cookie on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setLoginError(data.error || "Authentication failed");
      }
    } catch {
      setLoginError("Failed to connect to authentication server");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    setFetchingData(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data.dbStatus);
        setTickets(data.tickets);
        setProducts(data.products || []);
      } else if (res.status === 401) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Failed to load admin logs:", err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setProducts([]);
    setTickets([]);
  };

  // Instant Stock Status Toggle
  const handleToggleStock = async (product: Product, checked: boolean) => {
    // Optimistic Local State Update
    const originalProducts = [...products];
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, inStock: checked } : p
    );
    setProducts(updated);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: { ...product, inStock: checked } }),
      });
      if (!res.ok) {
        setProducts(originalProducts);
        alert("Failed to update status in Supabase. Check database logs.");
      }
    } catch (err) {
      setProducts(originalProducts);
      console.error(err);
      alert("Failed to connect to server.");
    }
  };

  // CRUD handlers
  const handleSyncDefaults = async () => {
    if (!confirm("Overwrite current inventory? This clears all existing products and seeds the default catalog list.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_defaults" }),
      });
      if (res.ok) {
        alert("Showroom stock seeded successfully!");
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(`Sync failed: ${data.error}`);
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (product: Product) => {
    setEditingId(product.id);
    setEditProduct({ ...product });
  };

  const handleSaveEdit = async () => {
    if (!editProduct.id || !editProduct.title || !editProduct.price) {
      alert("ID, Title, and Price are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: editProduct }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(`Failed to save details: ${data.error}`);
      }
    } catch {
      alert("Network error saving product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this product?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error}`);
      }
    } catch {
      alert("Network error deleting product.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.title || !newProduct.price) {
      alert("Please fill in the ID, Title, and Offer Price");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", product: newProduct }),
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewProduct({
          id: "",
          category: "laptops",
          title: "",
          description: "",
          price: "",
          originalPrice: "",
          badge: "",
          specs: [],
          inStock: true
        });
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(`Creation failed: ${data.error}`);
      }
    } catch {
      alert("Network error creating product.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecToNew = () => {
    if (newSpecText.trim()) {
      setNewProduct({
        ...newProduct,
        specs: [...(newProduct.specs || []), newSpecText.trim()]
      });
      setNewSpecText("");
    }
  };

  const handleRemoveSpecFromNew = (idx: number) => {
    setNewProduct({
      ...newProduct,
      specs: (newProduct.specs || []).filter((_, i) => i !== idx)
    });
  };

  // Counters for sidebar items
  const countByCategory = (cat: Product["category"]) => products.filter((p) => p.category === cat).length;
  
  // Filter products by search text & active section
  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    const matchesSection = activeSection === "all" || p.category === activeSection;
    
    const title = p.title || "";
    const desc = p.description || "";
    const id = p.id || "";

    const matchesSearch =
      searchText.trim() === "" ||
      title.toLowerCase().includes(searchText.toLowerCase()) ||
      desc.toLowerCase().includes(searchText.toLowerCase()) ||
      id.toLowerCase().includes(searchText.toLowerCase());
    return matchesSection && matchesSearch;
  });

  // Login Screen render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-950/20">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Sai Systems</h1>
            <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">Service Desk Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder-gray-500"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-black rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 flex flex-col">
      
      {/* ── Main Layout Wrapper ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* ── Sidebar (Left Column) ────────────────────────────────────────── */}
        <aside className="w-full md:w-64 bg-gray-900 border-r border-gray-800/80 p-6 flex flex-col justify-between gap-6 md:sticky md:top-0 md:h-screen">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-800">
              <div className="w-9 h-9 bg-orange-600/15 border border-orange-500/30 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Laptop size={18} />
              </div>
              <div>
                <h2 className="text-sm font-black text-white leading-tight">Sai Systems</h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Showroom Admin</p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1.5">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Showroom Inventory</p>
              
              <button
                onClick={() => setActiveSection("all")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "all"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span>📦 All Products</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{products.length}</span>
              </button>

              <button
                onClick={() => setActiveSection("laptops")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "laptops"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Laptop size={13} /> Laptops</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("laptops")}</span>
              </button>

              <button
                onClick={() => setActiveSection("desktops")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "desktops"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Monitor size={13} /> Desktops</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("desktops")}</span>
              </button>

              <button
                onClick={() => setActiveSection("cctv")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "cctv"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Cctv size={13} /> CCTV Surveillance</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("cctv")}</span>
              </button>

              <button
                onClick={() => setActiveSection("spare-parts")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "spare-parts"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Wrench size={13} /> Spare Parts</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("spare-parts")}</span>
              </button>

              <button
                onClick={() => setActiveSection("accessories")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "accessories"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Headphones size={13} /> Accessories</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("accessories")}</span>
              </button>

              <div className="h-px bg-gray-800 my-4" />
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Service Communications</p>

              <button
                onClick={() => setActiveSection("tickets")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all ${
                  activeSection === "tickets"
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}
              >
                <span className="flex items-center gap-2"><Inbox size={13} /> Leads &amp; Tickets</span>
                <span className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{tickets.length}</span>
              </button>
            </nav>
          </div>

          {/* Bottom Footer Section */}
          <div className="space-y-4 pt-4 border-t border-gray-850">
            {/* Database indicator */}
            <div className="flex flex-col gap-1.5 px-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Supabase Status</span>
                <button onClick={fetchAdminData} className="text-orange-500 hover:text-orange-400 transition-colors">
                  <RefreshCw size={10} className={fetchingData ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black">
                <span className={`w-2 h-2 rounded-full ${dbStatus.productsTable === "ready" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                <span className="text-gray-300">Catalog Database</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl transition-colors"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area (Right Column) ────────────────────────────── */}
        <main className="flex-1 bg-gray-950 p-6 md:p-10 overflow-y-auto">
          
          {/* Active section header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-white capitalize tracking-tight">
                {activeSection === "all" ? "Full Catalog Deals" : activeSection === "tickets" ? "Service Leads Inbox" : `${activeSection} category`}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {activeSection === "tickets"
                  ? `Viewing chatbot leads and WhatsApp callback requests.`
                  : `Manage product cards, prices, and stock statuses displayed in the showroom.`}
              </p>
            </div>

            {activeSection !== "tickets" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncDefaults}
                  disabled={loading}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-extrabold rounded-xl transition-colors"
                >
                  Sync Defaults
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl hover:opacity-95 shadow-md shadow-orange-950/20 active:scale-[0.98] transition-all"
                >
                  + Add Deal
                </button>
              </div>
            )}
          </div>

          {/* Render Add Form */}
          {showAddForm && activeSection !== "tickets" && (
            <div className="mb-8 bg-gray-900 border border-gray-850 p-6 rounded-3xl">
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <h3 className="text-base font-black text-white">Create New Showroom Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Unique Product ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. prod-t480-deals"
                      value={newProduct.id}
                      onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                      className="w-full bg-gray-900 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="laptops">Refurbished Laptops</option>
                      <option value="desktops">Refurbished Desktops</option>
                      <option value="cctv">CCTV Surveillance</option>
                      <option value="spare-parts">Spare Parts</option>
                      <option value="accessories">Mobile Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Offer Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. 30% OFF / New"
                      value={newProduct.badge}
                      onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HP EliteBook 840 G6"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Offer Price</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹15,999"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Original Price (Strikeout)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹48,000"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Product Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /products/latitude-7490.png"
                      value={newProduct.imageUrl || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Corporate business laptops, A++ showroom condition."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 px-3 py-2.5 rounded-lg text-xs text-white focus:outline-none"
                    />
                  </div>

                  {/* Specs adding list */}
                  <div className="sm:col-span-2 md:col-span-3 border-t border-gray-800 pt-4">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Add Hardware Specifications</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i5 8th Gen"
                        value={newSpecText}
                        onChange={(e) => setNewSpecText(e.target.value)}
                        className="flex-1 bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecToNew}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg"
                      >
                        Add Spec
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(newProduct.specs || []).map((spec, sidx) => (
                        <span key={sidx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs rounded-md font-medium">
                          {spec}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecFromNew(sidx)}
                            className="text-orange-400 hover:text-white font-bold text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── SECTION: Showroom Products List ─────────────────────────────── */}
          {activeSection !== "tickets" ? (
            <div className="space-y-6">
              
              {/* Search filter panel */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search products by title, details, or ID..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800/80 pl-10 pr-4 py-3 rounded-2xl text-xs text-white focus:outline-none focus:border-orange-500/40 transition-colors placeholder-gray-500"
                />
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-900/10 border border-gray-900 rounded-3xl">
                  <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h4 className="font-bold text-white">No products found</h4>
                  <p className="text-xs text-gray-500 mt-1">Try refining your search terms or select another category from the sidebar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-gray-900 border rounded-3xl p-5 sm:p-6 transition-all ${
                        editingId === product.id ? "border-orange-500 bg-orange-950/5" : "border-gray-800/60"
                      }`}
                    >
                      {editingId === product.id ? (
                        /* EDIT MODE */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-orange-950/20 pb-3 mb-2">
                            <span className="text-xs font-black text-orange-500 uppercase">Editing Product: {product.id}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 text-gray-400 hover:text-white text-xs font-bold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveEdit}
                                disabled={loading}
                                className="flex items-center gap-1 px-3.5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 transition-colors"
                              >
                                <Save size={14} /> Save Changes
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Offer Title</label>
                              <input
                                type="text"
                                value={editProduct.title || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Offer Price</label>
                              <input
                                type="text"
                                value={editProduct.price || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Original Price</label>
                              <input
                                type="text"
                                value={editProduct.originalPrice || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, originalPrice: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Badge text</label>
                              <input
                                type="text"
                                value={editProduct.badge || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Product Image URL</label>
                              <input
                                type="text"
                                value={editProduct.imageUrl || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                                placeholder="e.g. /products/latitude.png"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Category</label>
                              <select
                                value={editProduct.category}
                                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value as any })}
                                className="w-full bg-gray-900 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              >
                                <option value="laptops">Refurbished Laptops</option>
                                <option value="desktops">Refurbished Desktops</option>
                                <option value="cctv">CCTV Surveillance</option>
                                <option value="spare-parts">Spare Parts</option>
                                <option value="accessories">Mobile Accessories</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Description</label>
                              <input
                                type="text"
                                value={editProduct.description || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-400 mb-1">Specifications (comma separated)</label>
                              <input
                                type="text"
                                value={(editProduct.specs || []).join(", ")}
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    specs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                  })
                                }
                                className="w-full bg-white/5 border border-white/10 px-3 py-2 rounded-lg text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* VIEW MODE */
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          {product.imageUrl && (
                            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={product.imageUrl} alt={product.title} className="max-w-full max-h-full object-contain p-1" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[9px] font-black uppercase rounded">
                                {product.category}
                              </span>
                              {product.badge && (
                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-black uppercase rounded">
                                  {product.badge}
                                </span>
                              )}
                              <span className="text-[9px] text-gray-500 font-mono font-bold">ID: {product.id}</span>
                            </div>

                            <h4 className="text-base font-black text-white tracking-tight leading-tight">{product.title}</h4>
                            <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">{product.description}</p>
                            
                            {/* Specs list */}
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {product.specs.map((spec, sidx) => (
                                <span key={sidx} className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-medium text-gray-300">
                                  ✓ {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Pricing, Action control Panel */}
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-gray-800/80 pt-4 md:pt-0">
                            
                            <div className="text-left md:text-right">
                              <div className="text-lg font-black text-orange-500">{product.price}</div>
                              {product.originalPrice && <div className="text-[10px] text-gray-500 line-through mt-0.5">{product.originalPrice}</div>}
                            </div>

                            {/* Stock Toggle switches */}
                            <div className="flex flex-col gap-3.5 items-end">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={product.inStock}
                                    onChange={(e) => handleToggleStock(product, e.target.checked)}
                                    className="sr-only peer"
                                  />
                                  <div className="w-8 h-4 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${product.inStock ? "text-emerald-400" : "text-gray-500"}`}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                              </label>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStartEdit(product)}
                                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-xl transition-all"
                                  title="Edit Product Details"
                                >
                                  <Save size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-xl transition-all"
                                  title="Delete Product"
                                >
                                  <Trash size={13} />
                                </button>
                              </div>
                            </div>

                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ── SECTION: Chatbot Tickets & Leads ────────────────────────────── */
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900/10 border border-gray-900 rounded-3xl">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <h4 className="font-bold text-white">No tickets collected yet</h4>
                    <p className="text-xs text-gray-500 mt-1">Leads compiled by the AI chatbot will populate here automatically.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-gray-900 border border-gray-800/80 rounded-3xl p-6 hover:border-orange-500/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="space-y-2.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs text-gray-500 font-bold">{ticket.ticket_ref}</span>
                          <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-[10px] font-black uppercase rounded">
                            {ticket.status}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                            ticket.priority === "emergency" || ticket.priority === "high"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : "bg-gray-850 text-gray-400"
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className="text-[10px] text-gray-500 ml-auto md:ml-0 font-semibold">
                            {new Date(ticket.created_at).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-white tracking-tight leading-tight">{ticket.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">{ticket.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-gray-400">
                          {ticket.customer_name && <span>👤 Customer: <strong className="text-white">{ticket.customer_name}</strong></span>}
                          {ticket.customer_contact_phone && (
                            <a href={`tel:${ticket.customer_contact_phone}`} className="flex items-center gap-1 hover:text-orange-400">
                              <Phone size={12} className="text-orange-500 animate-pulse" /> Phone: <strong className="text-white">{ticket.customer_contact_phone}</strong>
                            </a>
                          )}
                          <span>📍 Location: <strong className="text-white">{ticket.site_city}</strong></span>
                        </div>
                      </div>

                      <div className="flex gap-2 border-t md:border-t-0 border-gray-800 pt-4 md:pt-0">
                        {ticket.customer_contact_phone && (
                          <a
                            href={`https://wa.me/${ticket.customer_contact_phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#25d366] hover:bg-[#22c35e] text-white text-xs font-black rounded-2xl shadow-lg transition-all"
                          >
                            <MessageCircle size={14} /> Open WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
export const dynamic = "force-dynamic";
