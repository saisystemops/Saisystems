"use client";
import React, { useState, useEffect } from "react";
import {
  Laptop,
  Monitor,
  Wrench,
  Headphones,
  Inbox,
  Lock,
  Trash,
  Save,
  LogOut,
  RefreshCw,
  Search,
  Phone,
  MessageCircle,
  FileText,
  AlertCircle,
  Calculator,
  Star,
  Sun,
  Moon
} from "lucide-react";
import type { Product } from "@/lib/data/default-products";

type DBStatus = {
  productsTable: "ready" | "missing";
  adminUsersTable: "ready" | "missing";
  blogsTable: "ready" | "missing";
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
  estimate_price?: number | null;
  notes?: string | null;
};

type Review = {
  id: string;
  name: string;
  review: string;
  service: string;
  rating: number;
  location: string;
  role: string;
  date: string;
  approved: boolean;
};

type Estimate = {
  service: string;
  brand: string;
  price: string;
  time: string;
  warranty: string;
};

type SidebarSection = "all" | "laptops" | "desktops" | "spare-parts" | "accessories" | "tickets" | "estimator" | "reviews" | "admin-users" | "blogs";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Admin users manager states
  const [adminUsers, setAdminUsers] = useState<{ id: string; username: string; role: string; created_at: string }[]>([]);
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("admin");
  const [adminManagerError, setAdminManagerError] = useState("");
  const [adminManagerSuccess, setAdminManagerSuccess] = useState("");
  const [userRole, setUserRole] = useState("admin");
  const [sessionUsername, setSessionUsername] = useState("");

  // Layout navigation & search
  const [activeSection, setActiveSection] = useState<SidebarSection>("all");
  const [searchText, setSearchText] = useState("");

  // Raw states loaded from API
  const [products, setProducts] = useState<Product[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [dbStatus, setDbStatus] = useState<DBStatus>({ productsTable: "missing", adminUsersTable: "missing", blogsTable: "missing" });
  
  // Reviews states
  const [adminReviews, setAdminReviews] = useState<Review[]>([]);
  
  // Cost Estimator pricing states
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [showAddEstimate, setShowAddEstimate] = useState(false);
  const [newEstimate, setNewEstimate] = useState({
    service: "Laptop Repair",
    brand: "HP",
    price: "",
    time: "Same Day",
    warranty: "365-day warranty",
  });
  const [editingEstimateKey, setEditingEstimateKey] = useState<string | null>(null);
  const [editEstimate, setEditEstimate] = useState<Estimate | null>(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  // Blogs manager states
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState("");
  const [blogsSuccess, setBlogsSuccess] = useState("");
  const [isSeedingBlogs, setIsSeedingBlogs] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);

  // Form states for creating/editing blog
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSlug, setBlogSlug] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogCategory, setBlogCategory] = useState("Laptop Repair");
  const [blogReadTime, setBlogReadTime] = useState(5);
  const [blogPublishedAt, setBlogPublishedAt] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("Sai Systems Team");
  const [blogMetaTitle, setBlogMetaTitle] = useState("");
  const [blogMetaDescription, setBlogMetaDescription] = useState("");
  const [blogKeywords, setBlogKeywords] = useState("");

  // Ticket progress updating states
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateEstimatePrice, setUpdateEstimatePrice] = useState("");
  const [updateNotes, setUpdateNotes] = useState("");
  const [ticketSaveLoading, setTicketSaveLoading] = useState(false);
  const [ticketError, setTicketError] = useState("");
  const [ticketSuccess, setTicketSuccess] = useState("");

  const handleStartUpdateTicket = (ticket: Ticket) => {
    setUpdatingTicketId(ticket.id);
    setUpdateStatus(ticket.status);
    setUpdateEstimatePrice(ticket.estimate_price ? String(ticket.estimate_price) : "");
    setUpdateNotes(ticket.notes || "");
    setTicketError("");
    setTicketSuccess("");
  };

  const handleSaveTicketUpdate = async (ticket: Ticket) => {
    setTicketSaveLoading(true);
    setTicketError("");
    setTicketSuccess("");
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: ticket.category === "appointment" ? "appointment" : (ticket.category === "lead" ? "lead" : "ticket"),
          id: ticket.id,
          status: updateStatus,
          estimatePrice: updateEstimatePrice !== "" ? Number(updateEstimatePrice) : null,
          notes: updateNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTicketSuccess("Incident updated successfully!");
        setUpdatingTicketId(null);
        await fetchAdminData(); // Reload all dashboard states
      } else {
        setTicketError(data.message || "Failed to update incident.");
      }
    } catch (err) {
      console.error(err);
      setTicketError("Network issue. Failed to update.");
    } finally {
      setTicketSaveLoading(false);
    }
  };

  const fetchBlogsList = async () => {
    setBlogsLoading(true);
    setBlogsError("");
    try {
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.data || []);
      } else {
        const errData = await res.json();
        setBlogsError(errData.message || "Failed to load blogs.");
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      setBlogsError("Network error. Please try again.");
    } finally {
      setBlogsLoading(false);
    }
  };

  const resetBlogForm = () => {
    setBlogTitle("");
    setBlogSlug("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogCategory("Laptop Repair");
    setBlogReadTime(5);
    setBlogPublishedAt(new Date().toISOString().split("T")[0]);
    setBlogAuthor("Sai Systems Team");
    setBlogMetaTitle("");
    setBlogMetaDescription("");
    setBlogKeywords("");
    setEditingBlog(null);
  };

  const handleEditBlogClick = (blog: any) => {
    setEditingBlog(blog);
    setBlogTitle(blog.title);
    setBlogSlug(blog.slug);
    setBlogExcerpt(blog.excerpt);
    setBlogContent(blog.content);
    setBlogCategory(blog.category);
    setBlogReadTime(blog.read_time);
    setBlogPublishedAt(blog.published_at ? blog.published_at.split("T")[0] : "");
    setBlogAuthor(blog.author);
    setBlogMetaTitle(blog.meta_title);
    setBlogMetaDescription(blog.meta_description);
    setBlogKeywords(Array.isArray(blog.keywords) ? blog.keywords.join(", ") : "");
    setShowBlogForm(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setBlogsLoading(true);
    setBlogsError("");
    setBlogsSuccess("");

    const keywordsArray = blogKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const payload = {
      id: editingBlog?.id,
      title: blogTitle,
      slug: blogSlug || blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      excerpt: blogExcerpt,
      content: blogContent,
      category: blogCategory,
      read_time: Number(blogReadTime),
      published_at: blogPublishedAt || new Date().toISOString(),
      author: blogAuthor,
      meta_title: blogMetaTitle || blogTitle,
      meta_description: blogMetaDescription || blogExcerpt,
      keywords: keywordsArray,
    };

    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        setBlogsSuccess(editingBlog ? "Blog post updated successfully!" : "Blog post created successfully!");
        setShowBlogForm(false);
        resetBlogForm();
        await fetchBlogsList();
      } else {
        setBlogsError(result.message || "Failed to save blog post.");
      }
    } catch (err) {
      console.error("Save blog error:", err);
      setBlogsError("Failed to save blog post. Network error.");
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this blog post permanently? This action cannot be undone.")) return;

    setBlogsLoading(true);
    setBlogsError("");
    setBlogsSuccess("");
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (result.success) {
        setBlogsSuccess("Blog post deleted successfully.");
        await fetchBlogsList();
      } else {
        setBlogsError(result.message || "Failed to delete blog post.");
      }
    } catch (err) {
      console.error("Delete blog error:", err);
      setBlogsError("Failed to delete blog post.");
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleSeedBlogs = async () => {
    setIsSeedingBlogs(true);
    setBlogsError("");
    setBlogsSuccess("");
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      });

      const result = await res.json();
      if (result.success) {
        setBlogsSuccess(result.message || "Existing blog posts seeded successfully!");
        await fetchBlogsList();
      } else {
        setBlogsError(result.message || "Failed to seed blog posts.");
      }
    } catch (err) {
      console.error("Seed blogs error:", err);
      setBlogsError("Failed to seed blog posts.");
    } finally {
      setIsSeedingBlogs(false);
    }
  };

  const fetchUsersList = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdminUsers(data.users || []);
        
        // Find current user in list to check role
        const sessionCookie = document.cookie.split(";").find((item) => item.trim().startsWith("admin_session="))?.split("=")[1];
        if (sessionCookie) {
          const rawVal = sessionCookie.split(".")[0];
          const parts = rawVal.split(":");
          if (parts.length >= 2) {
            const [u, r] = parts;
            setSessionUsername(u);
            setUserRole(r);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load admin users list:", err);
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

      // Fetch estimator prices
      const estRes = await fetch("/api/estimator");
      if (estRes.ok) {
        const estData = await estRes.json();
        setEstimates(estData || []);
      }

      // Fetch reviews
      const reviewsRes = await fetch("/api/admin/testimonials");
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setAdminReviews(reviewsData || []);
      }

      // Fetch users list
      await fetchUsersList();

      // Fetch blogs list
      await fetchBlogsList();
    } catch (err) {
      console.error("Failed to load admin logs:", err);
    } finally {
      setFetchingData(false);
    }
  };
  
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

  // Check auth cookie and theme on mount
  useEffect(() => {
    const sessionCookie = document.cookie.split(";").find((item) => item.trim().startsWith("admin_session="))?.split("=")[1];
    if (sessionCookie) {
      setIsAuthenticated(true);
      const rawVal = sessionCookie.split(".")[0];
      const parts = rawVal.split(":");
      if (parts.length >= 2) {
        const [u, r] = parts;
        setSessionUsername(u);
        setUserRole(r);
      }
    }

    // Theme sync
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.resolve().then(() => {
        fetchAdminData();
      });
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
        setSessionUsername(username);
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

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    setIsAuthenticated(false);
    setUsername("");
    setPassword("");
    setSessionUsername("");
    setUserRole("admin");
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

  // Estimator Pricing CRUD Handlers
  const handleCreateEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEstimate),
      });
      if (res.ok) {
        setNewEstimate({
          service: "Laptop Repair",
          brand: "HP",
          price: "",
          time: "Same Day",
          warranty: "365-day warranty",
        });
        setShowAddEstimate(false);
        fetchAdminData();
      } else {
        alert("Failed to save estimate pricing");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEditEstimate = async () => {
    if (!editEstimate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editEstimate),
      });
      if (res.ok) {
        setEditingEstimateKey(null);
        setEditEstimate(null);
        fetchAdminData();
      } else {
        alert("Failed to update estimate pricing");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEstimate = async (service: string, brand: string) => {
    if (!confirm(`Are you sure you want to delete the estimate for ${service} (${brand})?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/estimator?service=${encodeURIComponent(service)}&brand=${encodeURIComponent(brand)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to delete estimate");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncEstimates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/estimator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_defaults" }),
      });
      if (res.ok) {
        alert("Estimates synced to Supabase and local cache successfully!");
        fetchAdminData();
      } else {
        alert("Failed to sync default estimates");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_defaults" }),
      });
      if (res.ok) {
        alert("Default reviews synced to Supabase successfully!");
        fetchAdminData();
      } else {
        alert("Failed to sync default reviews");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reviews handlers
  const handleToggleReviewApproval = async (id: string, currentlyApproved: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: !currentlyApproved })
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to update review approval");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer review permanently?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Failed to delete review");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminManagerError("");
    setAdminManagerSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newAdminUsername,
          password: newAdminPassword,
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminManagerSuccess("Administrative account created successfully!");
        setNewAdminUsername("");
        setNewAdminPassword("");
        setNewAdminRole("admin");
        fetchAdminData();
      } else {
        setAdminManagerError(data.error || "Failed to create administrator");
      }
    } catch {
      setAdminManagerError("Connection failure while creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdminUser = async (usernameToDelete: string) => {
    if (!confirm(`Are you sure you want to permanently delete the admin account "${usernameToDelete}"?`)) return;
    setAdminManagerError("");
    setAdminManagerSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?username=${usernameToDelete}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminManagerSuccess(`Account "${usernameToDelete}" removed successfully.`);
        fetchAdminData();
      } else {
        setAdminManagerError(data.error || "Failed to delete account");
      }
    } catch {
      setAdminManagerError("Connection failure while removing account");
    } finally {
      setLoading(false);
    }
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
      <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-950" : "bg-gray-50"} flex items-center justify-center px-4 py-12 relative overflow-hidden transition-colors duration-300`}>
        {/* Floating Top-Right Theme Toggle */}
        <button
          onClick={() => {
            const next = !isDarkMode;
            setIsDarkMode(next);
            localStorage.setItem("theme", next ? "dark" : "light");
            document.documentElement.classList.toggle("dark", next);
          }}
          className="absolute top-6 right-6 p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full shadow-lg transition-colors cursor-pointer"
          title="Toggle Theme Mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Glow */}
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full relative z-10 bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl transition-colors">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-950/20">
              <Lock size={28} />
            </div>
            <h1 className="text-2xl font-black text-gray-950 dark:text-white tracking-tight">Sai Systems</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold uppercase tracking-wider">Service Desk Control Panel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-4 py-3 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-4 py-3 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Forgot Password Recovery (WhatsApp Direct Client-Side Route) */}
            <div className="flex justify-end text-xs">
              <a
                href="https://wa.me/917904108020?text=Hi%20Super%20Admin!%20I%20need%20to%20reset%20my%20Sai%20Systems%20admin%20password.%20My%20username%20is%3A%20"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-350 transition-colors font-extrabold cursor-pointer"
              >
                Forgot Password? Reset via WhatsApp
              </a>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-sm font-black rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Authenticating..." : "Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-gray-950 text-gray-200" : "bg-gray-50 text-gray-800"} flex flex-col transition-colors duration-300`}>
      
      {/* ── Main Layout Wrapper ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* ── Sidebar (Left Column) ────────────────────────────────────────── */}
        <aside className="w-full md:w-64 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800/80 p-6 flex flex-col justify-between gap-6 md:sticky md:top-0 md:h-screen transition-colors">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-200 dark:border-gray-800">
              <div className="w-9 h-9 bg-orange-600/15 border border-orange-500/30 text-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Laptop size={18} />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-black text-gray-950 dark:text-white leading-tight">Sai Systems</h2>
                <p className="text-[10px] text-gray-550 dark:text-gray-400 font-bold uppercase tracking-wider">Showroom Admin</p>
              </div>

              {/* Theme toggle next to title */}
              <button
                onClick={() => {
                  const next = !isDarkMode;
                  setIsDarkMode(next);
                  localStorage.setItem("theme", next ? "dark" : "light");
                  document.documentElement.classList.toggle("dark", next);
                }}
                className="p-1.5 bg-gray-200 dark:bg-gray-850 text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-white rounded-lg transition-colors border border-gray-300 dark:border-gray-800 cursor-pointer"
                title="Toggle Theme Mode"
              >
                {isDarkMode ? <Sun size={12} /> : <Moon size={12} />}
              </button>
            </div>

            {/* Navigation List */}
            <nav className="space-y-1.5">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Showroom Inventory</p>
              
              <button
                onClick={() => setActiveSection("all")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "all"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span>📦 All Products</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{products.length}</span>
              </button>

              <button
                onClick={() => setActiveSection("laptops")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "laptops"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Laptop size={13} /> Laptops</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("laptops")}</span>
              </button>

              <button
                onClick={() => setActiveSection("desktops")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "desktops"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Monitor size={13} /> Desktops</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("desktops")}</span>
              </button>

              <button
                onClick={() => setActiveSection("spare-parts")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "spare-parts"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Wrench size={13} /> Spare Parts</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("spare-parts")}</span>
              </button>

              <button
                onClick={() => setActiveSection("accessories")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "accessories"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Headphones size={13} /> Accessories</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{countByCategory("accessories")}</span>
              </button>

              <button
                onClick={() => setActiveSection("estimator")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "estimator"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Calculator size={13} /> Cost Estimator</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{estimates.length}</span>
              </button>

              <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">Service Communications</p>

              <button
                onClick={() => setActiveSection("tickets")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "tickets"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Inbox size={13} /> Leads &amp; Tickets</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{tickets.length}</span>
              </button>

              <button
                onClick={() => setActiveSection("reviews")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "reviews"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-950 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><Star size={13} /> Customer Reviews</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{adminReviews.length}</span>
              </button>

              {/* IT Blogs Section Tab */}
              <button
                onClick={() => setActiveSection("blogs")}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                  activeSection === "blogs"
                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-955 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                }`}
              >
                <span className="flex items-center gap-2"><FileText size={13} /> IT Blogs</span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{blogs.length}</span>
              </button>

              {/* Admin Accounts Section Tab */}
              {userRole === "super_admin" && (
                <>
                  <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
                  <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest px-2 mb-2">System Access</p>
                  <button
                    onClick={() => setActiveSection("admin-users")}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold rounded-xl transition-all border ${
                      activeSection === "admin-users"
                        ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-955 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/5 border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2"><Lock size={13} /> Admin Accounts</span>
                    <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">{adminUsers.length}</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* Bottom Footer Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            {/* Database indicator */}
            <div className="flex flex-col gap-1.5 px-2">
              <div className="flex items-center justify-between text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                <span>Supabase Status</span>
                <button onClick={fetchAdminData} className="text-orange-500 hover:text-orange-400 transition-colors cursor-pointer">
                  <RefreshCw size={10} className={fetchingData ? "animate-spin" : ""} />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[9px] font-black">
                <span className={`w-2 h-2 rounded-full ${dbStatus.productsTable === "ready" ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                <span className="text-gray-600 dark:text-gray-300">Catalog Database</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content Area (Right Column) ────────────────────────────── */}
        <main className="flex-1 bg-white dark:bg-gray-950 p-6 md:p-10 overflow-y-auto transition-colors">
          
          {/* Active section header block */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-950 dark:text-white capitalize tracking-tight">
                {activeSection === "all" 
                  ? "Full Catalog Deals" 
                  : activeSection === "tickets" 
                  ? "Service Leads Inbox" 
                  : activeSection === "reviews"
                  ? "Customer Reviews Moderation"
                  : activeSection === "admin-users"
                  ? "Admin User Accounts"
                  : activeSection === "blogs"
                  ? "IT Tips & Blog Manager"
                  : `${activeSection} category`}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeSection === "tickets"
                  ? "Viewing chatbot leads and WhatsApp callback requests."
                  : activeSection === "reviews"
                  ? "Approve, hide, or delete customer reviews submitted via the homepage testimonials wall."
                  : activeSection === "admin-users"
                  ? "Create and delete admin manager accounts authorized to edit the database."
                  : activeSection === "blogs"
                  ? "Add, edit, or delete dynamic articles and guides shown on your public IT blog page."
                  : "Manage product cards, prices, and stock statuses displayed in the showroom."}
              </p>
            </div>

            {activeSection === "blogs" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeedBlogs}
                  disabled={isSeedingBlogs}
                  className="px-4 py-2 bg-gray-105 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Imports standard blog articles from the code into your database"
                >
                  {isSeedingBlogs ? "Importing..." : "🔄 Import Default Blogs"}
                </button>
                <button
                  onClick={() => {
                    resetBlogForm();
                    setShowBlogForm(!showBlogForm);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl hover:opacity-95 shadow-md shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  + Add Blog Post
                </button>
              </div>
            )}

            {activeSection !== "tickets" && activeSection !== "estimator" && activeSection !== "reviews" && activeSection !== "admin-users" && activeSection !== "blogs" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl hover:opacity-95 shadow-md shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  + Add Deal
                </button>
              </div>
            )}
          </div>

          {/* Render Add Form */}
          {showAddForm && activeSection !== "tickets" && activeSection !== "estimator" && activeSection !== "reviews" && activeSection !== "blogs" && (
            <div className="mb-8 bg-gray-100 dark:bg-gray-900 border border-gray-250 dark:border-gray-850 p-6 rounded-3xl transition-colors">
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <h3 className="text-base font-black text-gray-950 dark:text-white">Create New Showroom Item</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Unique Product ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. prod-t480-deals"
                      value={newProduct.id}
                      onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as Product["category"] })}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="laptops">Refurbished Laptops</option>
                      <option value="desktops">New Desktops</option>
                      <option value="spare-parts">Spare Parts</option>
                      <option value="accessories">Mobile Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Offer Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. 30% OFF / New"
                      value={newProduct.badge}
                      onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HP EliteBook 840 G6"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Offer Price</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ₹15,999"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Original Price (Strikeout)</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹48,000"
                      value={newProduct.originalPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Product Image URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /products/latitude-7490.png"
                      value={newProduct.imageUrl || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Short Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Corporate business laptops, A++ showroom condition."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Specs adding list */}
                  <div className="sm:col-span-2 md:col-span-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                    <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Add Hardware Specifications</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Intel Core i5 8th Gen"
                        value={newSpecText}
                        onChange={(e) => setNewSpecText(e.target.value)}
                        className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpecToNew}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        Add Spec
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(newProduct.specs || []).map((spec, sidx) => (
                        <span key={sidx} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs rounded-md font-medium">
                          {spec}
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecFromNew(sidx)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-950 dark:hover:text-white font-bold text-[10px]"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
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

          {/* ── SECTION: Showroom Products List or Estimator ─────────────────── */}
          {activeSection === "tickets" || activeSection === "reviews" || activeSection === "admin-users" ? null : activeSection === "estimator" ? (
            /* ── SECTION: Cost Estimator Pricing Grid ── */
            <div className="space-y-6">
              {/* Header and Add Form */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-black text-gray-955 dark:text-white">Service Estimator Matrix</h3>
                  <p className="text-xs text-gray-550 dark:text-gray-400 mt-1">Manage interactive pricing calculator rules displayed in client diagnose flows.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncEstimates}
                    disabled={loading}
                    className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-250 dark:border-white/10 text-gray-800 dark:text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    Sync Default Estimates
                  </button>
                  <button
                    onClick={() => setShowAddEstimate(!showAddEstimate)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl hover:opacity-95 shadow-md shadow-orange-950/20 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    + Add Estimate Rule
                  </button>
                </div>
              </div>

              {/* Add Estimate Form */}
              {showAddEstimate && (
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-6 rounded-3xl transition-colors">
                  <form onSubmit={handleCreateEstimate} className="space-y-4">
                    <h3 className="text-base font-black text-gray-950 dark:text-white">Create New Pricing Estimate</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Service Type</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Screen Repair / Laptop Repair"
                          value={newEstimate.service}
                          onChange={(e) => setNewEstimate({ ...newEstimate, service: e.target.value })}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Device Brand</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dell / HP / Apple / Other"
                          value={newEstimate.brand}
                          onChange={(e) => setNewEstimate({ ...newEstimate, brand: e.target.value })}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Price Range</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ₹2,500 – ₹5,500"
                          value={newEstimate.price}
                          onChange={(e) => setNewEstimate({ ...newEstimate, price: e.target.value })}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Completion Time</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Same Day / 1 Hour / 1-2 Days"
                          value={newEstimate.time}
                          onChange={(e) => setNewEstimate({ ...newEstimate, time: e.target.value })}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase mb-1">Warranty Term</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 365-day warranty / 90-day warranty"
                          value={newEstimate.warranty}
                          onChange={(e) => setNewEstimate({ ...newEstimate, warranty: e.target.value })}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-800 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowAddEstimate(false)}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl cursor-pointer"
                      >
                        Add Rule
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Estimates Listing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {estimates.map((est, index) => {
                  const key = `${est.service}-${est.brand}`;
                  const isEditing = editingEstimateKey === key;

                  return (
                    <div key={index} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-5 rounded-3xl space-y-4 transition-colors">
                      {isEditing && editEstimate ? (
                        <div className="space-y-3">
                          <div className="text-xs font-black text-orange-500 uppercase">Editing Rule: {est.service} ({est.brand})</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-gray-650 dark:text-gray-400 mb-1">Price Range</label>
                              <input
                                type="text"
                                value={editEstimate.price}
                                onChange={(e) => setEditEstimate({ ...editEstimate, price: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-gray-650 dark:text-gray-400 mb-1">Repair Time</label>
                              <input
                                type="text"
                                value={editEstimate.time}
                                onChange={(e) => setEditEstimate({ ...editEstimate, time: e.target.value })}
                                className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[9px] font-bold text-gray-650 dark:text-gray-400 mb-1">Warranty Term</label>
                              <input
                                type="text"
                                value={editEstimate.warranty}
                                onChange={(e) => setEditEstimate({ ...editEstimate, warranty: e.target.value })}
                                className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-2.5 py-1.5 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                            <button
                              onClick={() => {
                                setEditingEstimateKey(null);
                                setEditEstimate(null);
                              }}
                              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEditEstimate}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg transition-colors cursor-pointer"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase rounded">
                                {est.service}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[9px] font-black uppercase rounded">
                                {est.brand}
                              </span>
                            </div>
                            <h4 className="text-sm font-extrabold text-gray-955 dark:text-white">{est.service} Estimate for {est.brand}</h4>
                            <div className="text-xs text-gray-650 dark:text-gray-400 space-y-1">
                              <div>💰 Price Range: <span className="text-orange-655 dark:text-orange-500 font-extrabold">{est.price}</span></div>
                              <div>⏱️ Completion: <span className="text-gray-900 dark:text-white font-bold">{est.time}</span></div>
                              <div>🛡️ Warranty: <span className="text-gray-950 dark:text-white font-bold">{est.warranty}</span></div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => {
                                setEditingEstimateKey(key);
                                setEditEstimate({ ...est });
                              }}
                              className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-250 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer"
                              title="Edit Estimate"
                            >
                              <Save size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteEstimate(est.service, est.brand)}
                              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl transition-all cursor-pointer"
                              title="Delete Estimate"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
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
                  className="w-full bg-gray-100 dark:bg-gray-900 border border-gray-250 dark:border-gray-800/80 pl-10 pr-4 py-3 rounded-2xl text-xs text-gray-900 dark:text-white focus:outline-none focus:border-orange-500/40 transition-colors placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-900 rounded-3xl">
                  <AlertCircle className="w-12 h-12 text-gray-550 dark:text-gray-650 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-950 dark:text-white">No products found</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-500 mt-1">Try refining your search terms or select another category from the sidebar.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-white dark:bg-gray-900 border rounded-3xl p-5 sm:p-6 transition-all ${
                        editingId === product.id ? "border-orange-500 bg-orange-950/5 dark:bg-orange-950/5" : "border-gray-200 dark:border-gray-800/60"
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
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Offer Title</label>
                              <input
                                type="text"
                                value={editProduct.title || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, title: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Offer Price</label>
                              <input
                                type="text"
                                value={editProduct.price || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Original Price</label>
                              <input
                                type="text"
                                value={editProduct.originalPrice || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, originalPrice: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Badge text</label>
                              <input
                                type="text"
                                value={editProduct.badge || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, badge: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Product Image URL</label>
                              <input
                                type="text"
                                value={editProduct.imageUrl || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, imageUrl: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                                placeholder="e.g. /products/latitude.png"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Category</label>
                              <select
                                value={editProduct.category}
                                onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value as Product["category"] })}
                                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              >
                                <option value="laptops">Refurbished Laptops</option>
                                <option value="desktops">New Desktops</option>
                                <option value="spare-parts">Spare Parts</option>
                                <option value="accessories">Mobile Accessories</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Description</label>
                              <input
                                type="text"
                                value={editProduct.description || ""}
                                onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">Specifications (comma separated)</label>
                              <input
                                type="text"
                                value={(editProduct.specs || []).join(", ")}
                                onChange={(e) =>
                                  setEditProduct({
                                    ...editProduct,
                                    specs: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                                  })
                                }
                                className="w-full bg-gray-55 dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* VIEW MODE */
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          {product.imageUrl && (
                            <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img src={product.imageUrl} alt={product.title} className="max-w-full max-h-full object-contain p-1" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase rounded">
                                {product.category}
                              </span>
                              {product.badge && (
                                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase rounded">
                                  {product.badge}
                                </span>
                              )}
                              <span className="text-[9px] text-gray-500 font-mono font-bold">ID: {product.id}</span>
                            </div>

                            <h4 className="text-base font-black text-gray-955 dark:text-white tracking-tight leading-tight">{product.title}</h4>
                            <p className="text-xs text-gray-550 dark:text-gray-400 leading-relaxed max-w-3xl">{product.description}</p>
                            
                            {/* Specs list */}
                            <div className="flex flex-wrap gap-1.5 pt-1.5">
                              {product.specs.map((spec, sidx) => (
                                <span key={sidx} className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-transparent rounded text-[10px] font-medium text-gray-700 dark:text-gray-300">
                                  ✓ {spec}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Pricing, Action control Panel */}
                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-gray-200 dark:border-gray-800/80 pt-4 md:pt-0">
                            
                            <div className="text-left md:text-right">
                              <div className="text-lg font-black text-orange-655 dark:text-orange-500">{product.price}</div>
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
                                  <div className="w-8 h-4 bg-gray-300 dark:bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${product.inStock ? "text-emerald-500 dark:text-emerald-400" : "text-gray-500"}`}>
                                  {product.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                              </label>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleStartEdit(product)}
                                  className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-250 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white rounded-xl transition-all cursor-pointer"
                                  title="Edit Product Details"
                                >
                                  <Save size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-xl transition-all cursor-pointer"
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
            )
          }

          {activeSection === "tickets" && (
            /* ── SECTION: Chatbot Tickets & Leads ────────────────────────────── */
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {tickets.length === 0 ? (
                  <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-800 rounded-3xl">
                    <FileText className="w-12 h-12 text-gray-550 dark:text-gray-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-950 dark:text-white">No tickets collected yet</h4>
                    <p className="text-xs text-gray-550 dark:text-gray-500 mt-1">Leads compiled by the AI chatbot will populate here automatically.</p>
                  </div>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800/80 rounded-3xl p-6 hover:border-orange-500/10 transition-all flex flex-col gap-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs text-gray-500 font-bold">{ticket.ticket_ref}</span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[10px] font-black uppercase rounded">
                              {ticket.status}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                              ticket.category === "appointment"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : ticket.category === "lead"
                                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20"
                                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                            }`}>
                              {ticket.category === "appointment" ? "📅 Appointment" : ticket.category === "lead" ? "✉️ Web Lead" : "🤖 Chat Ticket"}
                            </span>
                            <span className="text-[10px] text-gray-500 ml-auto md:ml-0 font-semibold">
                              {new Date(ticket.created_at).toLocaleString("en-IN")}
                            </span>
                          </div>

                          <h4 className="text-base font-black text-gray-955 dark:text-white tracking-tight leading-tight">{ticket.title}</h4>
                          <p className="text-xs text-gray-655 dark:text-gray-400 leading-relaxed max-w-3xl whitespace-pre-line">{ticket.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {ticket.customer_name && <span>👤 Customer: <strong className="text-gray-950 dark:text-white">{ticket.customer_name}</strong></span>}
                            {ticket.customer_contact_phone && (
                              <a href={`tel:${ticket.customer_contact_phone}`} className="flex items-center gap-1 hover:text-orange-500">
                                <Phone size={12} className="text-orange-500 animate-pulse" /> Phone: <strong className="text-gray-955 dark:text-white">{ticket.customer_contact_phone}</strong>
                              </a>
                            )}
                            <span>📍 Location: <strong className="text-gray-955 dark:text-white">{ticket.site_city}</strong></span>
                          </div>
                        </div>

                        <div className="flex gap-2 self-start md:self-center">
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

                      {/* Unified Status and Estimate Inline Update Form */}
                      {updatingTicketId === ticket.id ? (
                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800/80 rounded-2xl space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Status</label>
                              <select
                                value={updateStatus}
                                onChange={(e) => setUpdateStatus(e.target.value)}
                                className="w-full text-xs font-bold px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                              >
                                <option value="pending">Pending (Booked)</option>
                                <option value="new">New (Booked)</option>
                                <option value="diagnosing">Under Diagnosis</option>
                                <option value="estimate">Estimate Prepared</option>
                                <option value="progress">Repair In Progress</option>
                                <option value="repaired">Ready for Delivery</option>
                                <option value="delivered">Delivered &amp; Complete</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Cost Estimate (EST in ₹)</label>
                              <input
                                type="number"
                                placeholder="e.g. 1500"
                                value={updateEstimatePrice}
                                onChange={(e) => setUpdateEstimatePrice(e.target.value)}
                                className="w-full text-xs font-semibold px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2 md:col-span-3">
                              <label className="block text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-1">Technician Progress Notes</label>
                              <textarea
                                placeholder="Describe diagnostic details, part delays, or repair notes..."
                                value={updateNotes}
                                onChange={(e) => setUpdateNotes(e.target.value)}
                                rows={2}
                                className="w-full text-xs font-medium px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 border-t border-gray-200 dark:border-gray-800/80">
                            <button
                              type="button"
                              onClick={() => setUpdatingTicketId(null)}
                              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-[10px] font-black rounded-xl hover:opacity-90 cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={ticketSaveLoading}
                              onClick={() => handleSaveTicketUpdate(ticket)}
                              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black rounded-xl cursor-pointer disabled:opacity-60"
                            >
                              {ticketSaveLoading ? "Saving..." : "Save Changes"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                            {ticket.estimate_price !== undefined && ticket.estimate_price !== null ? (
                              <span className="font-extrabold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                                EST: ₹{ticket.estimate_price.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No Estimate Prepared Yet</span>
                            )}
                            {ticket.notes && (
                              <span className="text-gray-500 dark:text-gray-400 italic max-w-md truncate">
                                📝 {ticket.notes}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleStartUpdateTicket(ticket)}
                            className="text-[10px] font-black text-orange-655 hover:text-orange-500 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                          >
                            Update Progress &amp; Estimate →
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeSection === "reviews" && (
            /* ── SECTION: Customer Reviews Moderation ────────────────────────── */
            <div className="space-y-6">
              {adminReviews.length === 0 ? (
                <div className="text-center py-20 bg-gray-100/50 dark:bg-gray-900/10 border border-gray-200 dark:border-gray-900 rounded-3xl space-y-4">
                  <Star className="w-12 h-12 text-gray-550 dark:text-gray-600 mx-auto mb-3 animate-pulse" />
                  <h4 className="font-bold text-gray-955 dark:text-white">No reviews stored in database yet</h4>
                  <p className="text-xs text-gray-550 dark:text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Your Supabase database table is empty. Sync all 9 default customer testimonials to populate the table instantly.
                  </p>
                  <button
                    onClick={handleSyncReviews}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs font-black rounded-xl hover:opacity-95 shadow-md shadow-orange-950/20 active:scale-95 transition-all cursor-pointer"
                  >
                    {loading ? "Syncing..." : "Sync Default Reviews"}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adminReviews.map((rev) => (
                    <div key={rev.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-5 rounded-3xl space-y-4 flex flex-col justify-between transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-[9px] font-black uppercase rounded">
                              {rev.service}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-[9px] font-black uppercase rounded">
                              {rev.location}
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                            rev.approved 
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          }`}>
                            {rev.approved ? "Approved" : "Hidden"}
                          </span>
                        </div>

                        <div className="flex gap-0.5">
                          {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                            <Star key={idx} size={12} className="text-yellow-500 fill-yellow-550" />
                          ))}
                        </div>

                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed italic">
                          &ldquo;{rev.review}&rdquo;
                        </p>

                        <div className="text-[10px] text-gray-500">
                          By <strong className="text-gray-950 dark:text-white">{rev.name}</strong> ({rev.role}) on {rev.date}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 border-t border-gray-200 dark:border-gray-850 pt-3 mt-2">
                        <button
                          onClick={() => handleToggleReviewApproval(rev.id, rev.approved)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            rev.approved
                              ? "bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/20 text-amber-600 dark:text-amber-400"
                              : "bg-emerald-600/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {rev.approved ? "Hide Review" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete Review"
                        >
                          <Trash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeSection === "admin-users" && userRole === "super_admin" && (
            /* ── SECTION: Database Synced Admin User Management Panel ────────── */
            <div className="space-y-8">
              
              {/* Info Header alert */}
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex gap-3 text-orange-850 dark:text-orange-355 text-xs">
                <Lock size={18} className="flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
                <div>
                  <strong className="font-extrabold block mb-1">Super Administrator Control Panel</strong>
                  Administrators registered here are authorized to log into the Service Desk Control Panel, modify prices, catalog items, review logs, and manage tickets.
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Form to Register New User */}
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 transition-colors">
                  <h3 className="text-base font-black text-gray-950 dark:text-white mb-4">Register New Administrator</h3>
                  
                  <form onSubmit={handleCreateAdminUser} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Username</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter unique username"
                        value={newAdminUsername}
                        onChange={(e) => setNewAdminUsername(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Access Role</label>
                      <select
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value as "admin" | "super_admin")}
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                      >
                        <option value="admin">Admin (Modify Products & Leads)</option>
                        <option value="super_admin">Super Admin (All permissions)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Minimum 6 characters"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {adminManagerError && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl text-center">
                        {adminManagerError}
                      </div>
                    )}

                    {adminManagerSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl text-center">
                        {adminManagerSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? "Registering..." : "Add Admin Account"}
                    </button>
                  </form>
                </div>

                {/* Table list of all registered accounts */}
                <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 lg:col-span-2 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-black text-gray-955 dark:text-white">Active Database Accounts</h3>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-655 dark:text-gray-450 text-[10px] font-black rounded-md">
                      {adminUsers.length} total
                    </span>
                  </div>

                  {adminUsers.length === 0 ? (
                    <div className="text-center py-10 bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-xs text-gray-500">
                      Loading registered account logs...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-850 text-gray-650 dark:text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                            <th className="py-2.5 px-3">Username</th>
                            <th className="py-2.5 px-3">Access Level</th>
                            <th className="py-2.5 px-3">Registered At</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.map((usr) => {
                            const isSelf = usr.username === sessionUsername;
                            return (
                              <tr key={usr.id || usr.username} className="border-b border-gray-200 dark:border-gray-850/50 hover:bg-white/5 transition-colors">
                                <td className="py-3 px-3 font-extrabold text-gray-950 dark:text-white flex items-center gap-1.5">
                                  <span>👤 {usr.username}</span>
                                  {isSelf && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase rounded">
                                      You
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${
                                    usr.role === "super_admin"
                                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                      : "bg-gray-200 dark:bg-gray-850 text-gray-700 dark:text-gray-300"
                                  }`}>
                                    {usr.role === "super_admin" ? "Super Admin" : "Admin"}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-gray-500">
                                  {usr.created_at ? new Date(usr.created_at).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                  }) : "System Default"}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => handleDeleteAdminUser(usr.username)}
                                    disabled={isSelf || usr.username === "admin"}
                                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-30 text-rose-500 rounded-lg transition-colors cursor-pointer"
                                    title={isSelf ? "Cannot delete active session account" : "Delete Admin"}
                                  >
                                    <Trash size={12} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === "blogs" && (
            /* ── SECTION: IT Blogs Management panel ──────────────────────────── */
            <div className="space-y-6">
              
              {/* Database checks and warnings */}
              {dbStatus.blogsTable === "missing" && (
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 rounded-3xl flex gap-3 text-xs leading-relaxed font-semibold">
                  <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-extrabold block mb-1">Database Table Missing!</strong>
                    The `blogs` table does not exist in your Supabase database. Please copy the SQL script from `implementation_plan.md` and run it in the SQL Editor of your Supabase dashboard to start using dynamic blogs.
                  </div>
                </div>
              )}

              {/* Status and Error messages */}
              {blogsError && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-455 text-xs font-extrabold rounded-2xl text-center">
                  ⚠️ {blogsError}
                </div>
              )}
              {blogsSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-650 dark:text-emerald-400 text-xs font-extrabold rounded-2xl text-center">
                  ✅ {blogsSuccess}
                </div>
              )}

              {/* Blog Edit/Create Form */}
              {showBlogForm && (
                <div className="bg-gray-150 dark:bg-gray-900 border border-gray-250 dark:border-gray-805 rounded-3xl p-6 transition-colors">
                  <h3 className="text-base font-black text-gray-955 dark:text-white mb-4">
                    {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                  </h3>
                  
                  <form onSubmit={handleSaveBlog} className="space-y-4">
                    
                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Blog Title</label>
                        <input
                          type="text"
                          required
                          value={blogTitle}
                          onChange={(e) => {
                            setBlogTitle(e.target.value);
                            // Auto-generate slug if not editing
                            if (!editingBlog) {
                              setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
                            }
                          }}
                          placeholder="e.g. Tips for Repairing Laptop Screens"
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">URL Slug</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={blogSlug}
                            onChange={(e) => setBlogSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ""))}
                            placeholder="e.g. laptop-screen-repair-tips"
                            className="flex-1 bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setBlogSlug(blogTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))}
                            className="px-2.5 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-355 text-[10px] rounded-lg font-bold hover:opacity-90"
                          >
                            Generate
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Short Excerpt (Summary)</label>
                      <input
                        type="text"
                        required
                        value={blogExcerpt}
                        onChange={(e) => setBlogExcerpt(e.target.value)}
                        placeholder="Provide a short 1-2 sentence preview summary of the post..."
                        className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                      />
                    </div>

                    {/* Category, Read Time, Author, Published At */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Category</label>
                        <select
                          value={blogCategory}
                          onChange={(e) => setBlogCategory(e.target.value)}
                          className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        >
                          <option value="Laptop Repair">Laptop Repair</option>
                          <option value="Computer Maintenance">Computer Maintenance</option>
                          <option value="CCTV Security">CCTV Security</option>
                          <option value="Tech Insights">Tech Insights</option>
                          <option value="Guides">Guides</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Read Time (minutes)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={blogReadTime}
                          onChange={(e) => setBlogReadTime(Number(e.target.value))}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Author</label>
                        <input
                          type="text"
                          required
                          value={blogAuthor}
                          onChange={(e) => setBlogAuthor(e.target.value)}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Published Date</label>
                        <input
                          type="date"
                          value={blogPublishedAt}
                          onChange={(e) => setBlogPublishedAt(e.target.value)}
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Markdown Content editor */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Article Body Content (Markdown Supported)</label>
                      <textarea
                        required
                        rows={10}
                        value={blogContent}
                        onChange={(e) => setBlogContent(e.target.value)}
                        placeholder="Write your article body here in Markdown format. Support headings, lists, links, etc."
                        className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none font-mono leading-relaxed"
                      />
                    </div>

                    {/* SEO Settings */}
                    <div className="border-t border-gray-250 dark:border-gray-800 pt-4 mt-2 space-y-4">
                      <h4 className="text-xs font-black text-gray-955 dark:text-white uppercase tracking-wider">SEO &amp; Metadata Optimizations</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Meta Title</label>
                          <input
                            type="text"
                            value={blogMetaTitle}
                            onChange={(e) => setBlogMetaTitle(e.target.value)}
                            placeholder="Defaults to title if left blank..."
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Meta Keywords (Comma separated)</label>
                          <input
                            type="text"
                            value={blogKeywords}
                            onChange={(e) => setBlogKeywords(e.target.value)}
                            placeholder="e.g. laptop repair, computer tips, screen guide"
                            className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-bold text-gray-650 dark:text-gray-400 uppercase mb-1">Meta Description</label>
                        <textarea
                          rows={2}
                          value={blogMetaDescription}
                          onChange={(e) => setBlogMetaDescription(e.target.value)}
                          placeholder="Defaults to excerpt summary if left blank..."
                          className="w-full bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 px-3 py-2 rounded-lg text-xs text-gray-900 dark:text-white focus:outline-none leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowBlogForm(false);
                          resetBlogForm();
                        }}
                        className="px-4 py-2 bg-gray-205 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={blogsLoading}
                        className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:opacity-95 text-white text-xs font-black rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                      >
                        {blogsLoading ? "Saving..." : editingBlog ? "Update Post" : "Publish Post"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Blog posts list table */}
              <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-black text-gray-955 dark:text-white">Active Blog Posts</h3>
                  <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-655 dark:text-gray-450 text-[10px] font-black rounded-md">
                    {blogs.length} posts
                  </span>
                </div>

                {blogsLoading && blogs.length === 0 ? (
                  <div className="text-center py-10 bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-xs text-gray-550">
                    Loading blogs list...
                  </div>
                ) : blogs.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 border border-dashed border-gray-300 dark:border-white/10 rounded-2xl text-xs text-gray-550 dark:text-gray-400 space-y-3">
                    <p>No blog posts found in the database.</p>
                    {dbStatus.blogsTable === "ready" && (
                      <button
                        onClick={handleSeedBlogs}
                        disabled={isSeedingBlogs}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-[11px] uppercase tracking-wider transition-all cursor-pointer"
                      >
                        {isSeedingBlogs ? "Importing..." : "🔄 Import 10 Default Blogs"}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-850 text-gray-650 dark:text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="py-2.5 px-3">Title</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3">Published Date</th>
                          <th className="py-2.5 px-3">Read Time</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((post) => (
                          <tr key={post.id} className="border-b border-gray-200 dark:border-gray-850/50 hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-extrabold text-gray-950 dark:text-white max-w-xs truncate">
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">
                                {post.title}
                              </a>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-750 dark:text-gray-300 text-[9px] font-black rounded uppercase">
                                {post.category}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-gray-500">
                              {post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              }) : "Draft"}
                            </td>
                            <td className="py-3 px-3 text-gray-500 font-bold font-mono">
                              ⏱️ {post.read_time} min
                            </td>
                            <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => handleEditBlogClick(post)}
                                className="px-2.5 py-1.5 bg-gray-200 dark:bg-gray-850 hover:bg-gray-250 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-lg transition-colors cursor-pointer text-[10px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(post.id)}
                                className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center align-middle"
                                title="Delete Post"
                              >
                                <Trash size={12} />
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
          )}

        </main>
      </div>

    </div>
  );
}
export const dynamic = "force-dynamic";
