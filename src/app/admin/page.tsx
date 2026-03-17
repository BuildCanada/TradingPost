"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/RichTextEditor"), {
  ssr: false,
});

const FEED_TYPES = ["BLOG", "SUBSTACK", "X", "TIKTOK", "IG", "YOUTUBE"] as const;
type FeedType = (typeof FEED_TYPES)[number];

interface FeedItem {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  author: string | null;
  authorPhoto: string | null;
  image: string | null;
  body: string | null;
  url: string | null;
  tags: string | null;
  featured: boolean;
  createdAt: string;
}

const EMPTY_FORM = {
  type: "BLOG" as FeedType,
  title: "",
  subtitle: "",
  author: "",
  authorPhoto: "",
  image: "",
  body: "",
  url: "",
  tags: "",
  createdAt: "",
  featured: false,
};

function isBlogType(type: string) {
  return type === "BLOG";
}

function isSubstackType(type: string) {
  return type === "SUBSTACK";
}

function isSocialType(type: string) {
  return type === "X" || type === "TIKTOK" || type === "IG" || type === "YOUTUBE";
}

interface MemoItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorImage: string | null;
  keyMessage1: string;
  keyMessage2: string | null;
  keyMessage3: string | null;
  body: string;
  supporters: string | null;
  splashImage: string | null;
  seoImage: string | null;
  category: string | null;
  publishedAt: string | null;
  twitterEmbed: string | null;
  featured: boolean;
  createdAt: string;
}

const EMPTY_MEMO = {
  title: "",
  slug: "",
  author: "",
  authorImage: "",
  keyMessage1: "",
  keyMessage2: "",
  keyMessage3: "",
  body: "",
  supporters: "",
  splashImage: "",
  seoImage: "",
  category: "",
  publishedAt: "",
  twitterEmbed: "",
  featured: false,
};

export default function AdminPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "authorPhoto" | null>(
    null
  );
  const [fetchingEmbed, setFetchingEmbed] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Memo state
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [memoForm, setMemoForm] = useState(EMPTY_MEMO);
  const [editingMemoSlug, setEditingMemoSlug] = useState<string | null>(null);
  const [memoUploading, setMemoUploading] = useState(false);
  const [activeSection, setActiveSection] = useState<"feed" | "memos">("feed");

  const loadItems = useCallback(async () => {
    const res = await fetch("/api/feed");
    const data = await res.json();
    setItems(data);
  }, []);

  const loadMemos = useCallback(async () => {
    const res = await fetch("/api/memos");
    if (!res.ok) return;
    const data = await res.json();
    setMemos(data);
  }, []);

  useEffect(() => {
    loadItems();
    loadMemos();
  }, [loadItems, loadMemos]);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "image" | "authorPhoto"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(field);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setForm((f) => ({ ...f, [field]: data.url }));
    setUploading(null);
  }

  async function fetchEmbed(url: string, type: FeedType) {
    if (!url || !isSocialType(type)) return;
    setFetchingEmbed(true);
    setEmbedError(null);
    try {
      const res = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, type }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch embed data");
      }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        body: data.body || f.body,
        image: data.image || f.image,
        author: data.author || f.author,
        authorPhoto: data.authorPhoto || f.authorPhoto,
      }));
    } catch (err) {
      setEmbedError(String(err instanceof Error ? err.message : err));
    } finally {
      setFetchingEmbed(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    try {
      // If toggling featured ON, unset any existing featured item first
      if (form.featured) {
        const currentFeatured = items.find(
          (i) => i.featured && i.id !== editingId
        );
        if (currentFeatured) {
          await fetch(`/api/feed/${currentFeatured.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ featured: false }),
          });
        }
      }

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/feed/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch("/api/feed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to save (${res.status})`);
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
      loadItems();
    } catch (err) {
      setSubmitError(String(err instanceof Error ? err.message : err));
    }
  }

  function startEdit(item: FeedItem) {
    setEditingId(item.id);
    setForm({
      type: item.type as FeedType,
      title: item.title || "",
      subtitle: item.subtitle || "",
      author: item.author || "",
      authorPhoto: item.authorPhoto || "",
      image: item.image || "",
      body: item.body || "",
      url: item.url || "",
      tags: item.tags || "",
      createdAt: item.createdAt ? item.createdAt.slice(0, 10) : "",
      featured: item.featured,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/feed/${id}`, { method: "DELETE" });
    if (editingId === id) {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }
    loadItems();
  }

  async function toggleFeatured(item: FeedItem) {
    const newFeatured = !item.featured;

    // If setting to featured, unset current featured
    if (newFeatured) {
      const currentFeatured = items.find((i) => i.featured && i.id !== item.id);
      if (currentFeatured) {
        await fetch(`/api/feed/${currentFeatured.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featured: false }),
        });
      }
    }

    await fetch(`/api/feed/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: newFeatured }),
    });
    loadItems();
  }

  // ── Memo handlers ──

  function slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleMemoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    field: "authorImage" | "splashImage" | "seoImage"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMemoUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setMemoForm((f) => ({ ...f, [field]: data.url }));
    setMemoUploading(false);
  }

  async function handleMemoSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingMemoSlug) {
      await fetch(`/api/memos/${editingMemoSlug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoForm),
      });
    } else {
      await fetch("/api/memos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoForm),
      });
    }

    setMemoForm(EMPTY_MEMO);
    setEditingMemoSlug(null);

    loadMemos();
  }

  function startEditMemo(memo: MemoItem) {
    setEditingMemoSlug(memo.slug);
    setMemoForm({
      title: memo.title,
      slug: memo.slug,
      author: memo.author,
      authorImage: memo.authorImage || "",
      keyMessage1: memo.keyMessage1,
      keyMessage2: memo.keyMessage2 || "",
      keyMessage3: memo.keyMessage3 || "",
      body: memo.body,
      supporters: memo.supporters || "",
      splashImage: memo.splashImage || "",
      seoImage: memo.seoImage || "",
      category: memo.category || "",
      publishedAt: memo.publishedAt ? memo.publishedAt.slice(0, 10) : "",
      twitterEmbed: memo.twitterEmbed || "",
      featured: memo.featured,
    });
    setActiveSection("memos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteMemo(slug: string) {
    if (!confirm("Delete this memo?")) return;
    await fetch(`/api/memos/${slug}`, { method: "DELETE" });
    if (editingMemoSlug === slug) {
      setMemoForm(EMPTY_MEMO);
      setEditingMemoSlug(null);
    }
    loadMemos();
  }

  async function toggleMemoFeatured(memo: MemoItem) {
    await fetch(`/api/memos/${memo.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !memo.featured }),
    });
    loadMemos();
  }

  const showFullForm = isBlogType(form.type);

  return (
    <div className="max-w-4xl mx-auto py-10 px-5">
      {/* Section tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveSection("feed")}
          className={`text-2xl font-bold pb-1 border-b-2 transition-colors ${
            activeSection === "feed"
              ? "border-black text-black"
              : "border-transparent text-gray-300 hover:text-gray-500"
          }`}
        >
          Feed CMS
        </button>
        <button
          onClick={() => setActiveSection("memos")}
          className={`text-2xl font-bold pb-1 border-b-2 transition-colors ${
            activeSection === "memos"
              ? "border-black text-black"
              : "border-transparent text-gray-300 hover:text-gray-500"
          }`}
        >
          Memos CMS
        </button>
      </div>

      {activeSection === "feed" && (<>

      {/* Sync from Google Sheet */}
      <div className="border border-gray-200 rounded p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Sync from Socials Sheet</p>
          <p className="text-xs text-gray-500">Import new posts from the Google Sheet (Zapier-populated)</p>
        </div>
        <div className="flex items-center gap-3">
          {syncResult && (
            <span className="text-xs text-gray-500">{syncResult}</span>
          )}
          <button
            type="button"
            disabled={syncing}
            onClick={async () => {
              setSyncing(true);
              setSyncResult(null);
              try {
                const res = await fetch("/api/feed/sync", { method: "POST" });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Sync failed");
                setSyncResult(`Imported ${data.imported}, skipped ${data.skipped}`);
                if (data.imported > 0) loadItems();
              } catch (err) {
                setSyncResult(String(err instanceof Error ? err.message : err));
              } finally {
                setSyncing(false);
              }
            }}
            className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-40 whitespace-nowrap"
          >
            {syncing ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 rounded p-6 mb-10 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingId ? "Edit Feed Item" : "New Feed Item"}
        </h2>

        {/* Type */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Type
          </label>
          <select
            value={form.type}
            onChange={(e) =>
              setForm((f) => ({ ...f, type: e.target.value as FeedType }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {FEED_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Title — always shown */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Post title"
          />
        </div>

        {/* Substack: just URL + date */}
        {isSubstackType(form.type) && (
          <>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Substack URL
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="https://buildcanada.substack.com/p/..."
              />
            </div>
            {/* Header Image */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Header Image
              </label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <img
                    src={form.image}
                    alt=""
                    className="w-20 h-14 object-cover rounded border"
                  />
                )}
                <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
                  {uploading === "image" ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "image")}
                  />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Date Posted
              </label>
              <input
                type="date"
                value={form.createdAt}
                onChange={(e) => setForm((f) => ({ ...f, createdAt: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        {/* Blog: full form */}
        {showFullForm && (
          <>
            {/* Subtitle */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="Short description"
              />
            </div>

            {/* Date Posted */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Date Posted
              </label>
              <input
                type="date"
                value={form.createdAt}
                onChange={(e) => setForm((f) => ({ ...f, createdAt: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Author */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="Author name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                  Author Photo
                </label>
                <div className="flex items-center gap-2">
                  {form.authorPhoto && (
                    <img
                      src={form.authorPhoto}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                  )}
                  <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
                    {uploading === "authorPhoto" ? "Uploading..." : "Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUpload(e, "authorPhoto")}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Cover Image
              </label>
              <div className="flex items-center gap-3">
                {form.image && (
                  <img
                    src={form.image}
                    alt=""
                    className="w-20 h-14 object-cover rounded border"
                  />
                )}
                <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
                  {uploading === "image" ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUpload(e, "image")}
                  />
                </label>
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Body
              </label>
              <RichTextEditor
                value={form.body}
                onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                placeholder="Write blog post..."
                minHeight="300px"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                placeholder="e.g. innovation, policy, digital-infrastructure"
              />
              {form.tags && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.split(",").map((tag, i) => tag.trim() && (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-gray-100 border border-gray-200 rounded-full text-gray-600"
                    >
                      {tag.trim()}
                      <button
                        type="button"
                        onClick={() => {
                          const tags = form.tags.split(",").map(t => t.trim()).filter((_, idx) => idx !== i);
                          setForm(f => ({ ...f, tags: tags.join(", ") }));
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!showFullForm && (
          <>
            <div>
              <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                Post URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, url: e.target.value }))
                  }
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  placeholder="https://x.com/buildcanada/status/..."
                />
                <button
                  type="button"
                  disabled={!form.url || fetchingEmbed}
                  onClick={() => fetchEmbed(form.url, form.type)}
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {fetchingEmbed ? "Fetching..." : "Fetch Embed"}
                </button>
              </div>
            </div>
            {embedError && (
              <p className="text-xs text-red-500">{embedError}</p>
            )}

            {/* Auto-populated preview */}
            {(form.image || form.body || form.author) && (
              <div className="border border-gray-200 rounded p-4 space-y-3 bg-gray-50">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">
                  Embed Preview
                </p>
                {form.image && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Image
                    </label>
                    <img
                      src={form.image}
                      alt=""
                      className="w-32 h-24 object-cover rounded border"
                    />
                  </div>
                )}
                {form.author && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Author
                    </label>
                    <p className="text-sm">{form.author}</p>
                  </div>
                )}
                {form.body && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Post Text
                    </label>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {form.body}
                    </p>
                  </div>
                )}

                {/* Allow manual image override if embed had none */}
                {!form.image && (
                  <div>
                    <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
                      Upload Image (no image found)
                    </label>
                    <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50 inline-block">
                      {uploading === "image" ? "Uploading..." : "Upload Image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e, "image")}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Featured toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              form.featured ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                form.featured ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">Featured Post</span>
        </div>

        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {submitError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white text-sm px-5 py-2 rounded hover:bg-gray-800"
          >
            {editingId ? "Save Changes" : "Create Post"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setEditingId(null);
              }}
              className="text-sm text-gray-500 px-4 py-2 border border-gray-300 rounded hover:border-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Items list */}
      <h2 className="text-lg font-semibold mb-4">
        All Feed Items ({items.length})
      </h2>
      {items.length === 0 && (
        <p className="text-gray-400 text-sm">No items yet. Create one above.</p>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 rounded p-4 flex items-start gap-4"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="w-16 h-16 object-cover rounded border shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-100 rounded border shrink-0 flex items-center justify-center text-[10px] text-gray-400 uppercase">
                {item.type}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 border rounded text-gray-500">
                  {item.type}
                </span>
                {item.featured && (
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-black text-white rounded">
                    Featured
                  </span>
                )}
              </div>
              <p className="font-medium text-sm truncate">
                {item.title || "(untitled)"}
              </p>
              {item.subtitle && (
                <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
              )}
              {item.author && (
                <p className="text-xs text-gray-400 mt-0.5">
                  By {item.author}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => toggleFeatured(item)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  item.featured
                    ? "bg-black text-white border-black hover:bg-gray-700"
                    : "text-gray-500 border-gray-300 hover:border-black hover:text-black"
                }`}
              >
                {item.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => startEdit(item)}
                className="text-[10px] px-2 py-1 rounded border border-gray-300 text-gray-500 hover:border-black hover:text-black"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-[10px] px-2 py-1 rounded border border-gray-300 text-red-400 hover:border-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      </>)}

      {/* ════════════════════════════════════════════ */}
      {/* MEMOS CMS                                   */}
      {/* ════════════════════════════════════════════ */}
      {activeSection === "memos" && (<>

      {/* Memo Form */}
      <form
        onSubmit={handleMemoSubmit}
        className="border border-gray-200 rounded p-6 mb-10 space-y-4"
      >
        <h2 className="text-lg font-semibold">
          {editingMemoSlug ? "Edit Memo" : "New Memo"}
        </h2>

        {/* Title */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Title
          </label>
          <input
            type="text"
            value={memoForm.title}
            onChange={(e) => {
              const title = e.target.value;
              setMemoForm((f) => ({
                ...f,
                title,
                slug: editingMemoSlug ? f.slug : slugify(title),
              }));
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Memo title"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Slug
          </label>
          <input
            type="text"
            value={memoForm.slug}
            onChange={(e) =>
              setMemoForm((f) => ({ ...f, slug: e.target.value }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
            placeholder="memo-url-slug"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Category
          </label>
          <input
            type="text"
            value={memoForm.category}
            onChange={(e) =>
              setMemoForm((f) => ({ ...f, category: e.target.value }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="e.g. digital-innovation, defense, economy"
          />
        </div>

        {/* Date Published */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Date Published
          </label>
          <input
            type="date"
            value={memoForm.publishedAt}
            onChange={(e) =>
              setMemoForm((f) => ({ ...f, publishedAt: e.target.value }))
            }
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>

        {/* Author + Author Image */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Author
            </label>
            <input
              type="text"
              value={memoForm.author}
              onChange={(e) =>
                setMemoForm((f) => ({ ...f, author: e.target.value }))
              }
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Author name"
              required
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Author Image
            </label>
            <div className="flex items-center gap-2">
              {memoForm.authorImage && (
                <img
                  src={memoForm.authorImage}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border"
                />
              )}
              <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
                {memoUploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleMemoUpload(e, "authorImage")}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Key Messages */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Key Message 1 (Main Description)
          </label>
          <textarea
            value={memoForm.keyMessage1}
            onChange={(e) =>
              setMemoForm((f) => ({ ...f, keyMessage1: e.target.value }))
            }
            rows={2}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder="Primary key message / description"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Key Message 2
            </label>
            <textarea
              value={memoForm.keyMessage2}
              onChange={(e) =>
                setMemoForm((f) => ({ ...f, keyMessage2: e.target.value }))
              }
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Second key message"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
              Key Message 3
            </label>
            <textarea
              value={memoForm.keyMessage3}
              onChange={(e) =>
                setMemoForm((f) => ({ ...f, keyMessage3: e.target.value }))
              }
              rows={2}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="Third key message"
            />
          </div>
        </div>

        {/* Body */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Body
          </label>
          <RichTextEditor
            value={memoForm.body}
            onChange={(html) => setMemoForm((f) => ({ ...f, body: html }))}
            placeholder="Write memo body..."
            minHeight="300px"
          />
        </div>

        {/* Supporters */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Supporters
          </label>
          <RichTextEditor
            value={memoForm.supporters}
            onChange={(html) => setMemoForm((f) => ({ ...f, supporters: html }))}
            placeholder="List supporters..."
            minHeight="120px"
          />
        </div>

        {/* Splash Image */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            Splash Image (Hero Background)
          </label>
          <div className="flex items-center gap-3">
            {memoForm.splashImage && (
              <img
                src={memoForm.splashImage}
                alt=""
                className="w-20 h-14 object-cover rounded border"
              />
            )}
            <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
              {memoUploading ? "Uploading..." : "Upload Splash Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMemoUpload(e, "splashImage")}
              />
            </label>
          </div>
        </div>

        {/* SEO Image */}
        <div>
          <label className="block text-xs uppercase tracking-wide text-gray-500 mb-1">
            SEO Image
          </label>
          <div className="flex items-center gap-3">
            {memoForm.seoImage && (
              <img
                src={memoForm.seoImage}
                alt=""
                className="w-20 h-14 object-cover rounded border"
              />
            )}
            <label className="cursor-pointer text-xs border border-gray-300 rounded px-3 py-2 hover:bg-gray-50">
              {memoUploading ? "Uploading..." : "Upload SEO Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleMemoUpload(e, "seoImage")}
              />
            </label>
          </div>
        </div>

        {/* Twitter Embed */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs uppercase tracking-wide text-gray-500">
              Twitter Embed
            </label>
            <button
              type="button"
              onClick={() => {
                // Build tweet body text from key message 1
                const tweetBody = memoForm.keyMessage1.trim();
                const readLink = `https://buildcanada.ca/memos/${memoForm.slug}`;
                // Format author display name from slug (e.g. "john-ruffolo" -> "John Ruffolo")
                const authorDisplay = memoForm.author
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");
                const embed = `<div data-rt-embed-type='true'><blockquote class="twitter-tweet"><p lang="en" dir="ltr">${tweetBody}<br><br>Read &quot;${memoForm.title}&quot; from ${authorDisplay}: <a href="${readLink}">${readLink}</a></p>&mdash; Build Canada (@build_canada) <a href="TWEET_URL_HERE">DATE_HERE</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></div>`;
                setMemoForm((f) => ({ ...f, twitterEmbed: embed }));
              }}
              className="text-xs text-gray-500 border border-gray-300 rounded px-2 py-0.5 hover:bg-gray-50"
            >
              Generate from memo
            </button>
          </div>
          <textarea
            value={memoForm.twitterEmbed}
            onChange={(e) =>
              setMemoForm((f) => ({ ...f, twitterEmbed: e.target.value }))
            }
            rows={6}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono"
            placeholder="Generated tweet text..."
          />
          {memoForm.twitterEmbed && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(memoForm.twitterEmbed);
              }}
              className="mt-1.5 text-xs text-gray-500 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
            >
              Copy to clipboard
            </button>
          )}
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setMemoForm((f) => ({ ...f, featured: !f.featured }))
            }
            className={`w-10 h-5 rounded-full relative transition-colors ${
              memoForm.featured ? "bg-black" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                memoForm.featured ? "left-5" : "left-0.5"
              }`}
            />
          </button>
          <span className="text-sm text-gray-600">Featured Memo</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white text-sm px-5 py-2 rounded hover:bg-gray-800"
          >
            {editingMemoSlug ? "Save Changes" : "Create Memo"}
          </button>
          {editingMemoSlug && (
            <button
              type="button"
              onClick={() => {
                setMemoForm(EMPTY_MEMO);
                setEditingMemoSlug(null);
            
              }}
              className="text-sm text-gray-500 px-4 py-2 border border-gray-300 rounded hover:border-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Memos list */}
      <h2 className="text-lg font-semibold mb-4">
        All Memos ({memos.length})
      </h2>
      {memos.length === 0 && (
        <p className="text-gray-400 text-sm">No memos yet. Create one above.</p>
      )}
      <div className="space-y-3">
        {memos.map((memo) => (
          <div
            key={memo.id}
            className="border border-gray-200 rounded p-4 flex items-start gap-4"
          >
            {memo.authorImage ? (
              <img
                src={memo.authorImage}
                alt=""
                className="w-10 h-10 rounded-full object-cover border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-full border shrink-0 flex items-center justify-center text-[10px] text-gray-400 uppercase">
                M
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 border rounded text-gray-500">
                  /{memo.slug}
                </span>
                {memo.featured && (
                  <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-black text-white rounded">
                    Featured
                  </span>
                )}
              </div>
              <p className="font-medium text-sm truncate">{memo.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">By {memo.author}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {memo.keyMessage1}
              </p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button
                onClick={() => toggleMemoFeatured(memo)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  memo.featured
                    ? "bg-black text-white border-black hover:bg-gray-700"
                    : "text-gray-500 border-gray-300 hover:border-black hover:text-black"
                }`}
              >
                {memo.featured ? "Unfeature" : "Feature"}
              </button>
              <button
                onClick={() => startEditMemo(memo)}
                className="text-[10px] px-2 py-1 rounded border border-gray-300 text-gray-500 hover:border-black hover:text-black"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteMemo(memo.slug)}
                className="text-[10px] px-2 py-1 rounded border border-gray-300 text-red-400 hover:border-red-500 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      </>)}
    </div>
  );
}
