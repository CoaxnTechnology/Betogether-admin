import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button } from "@/components/ui/button";
import {
  createBlog,
  getBlogByIdAdmin,
  updateBlog,
} from "../api/blog.api";

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const TOOLBAR_TAGS: { label: string; open: string; close: string }[] = [
  { label: "H2", open: "<h2>", close: "</h2>" },
  { label: "H3", open: "<h3>", close: "</h3>" },
  { label: "Bold", open: "<strong>", close: "</strong>" },
  { label: "Italic", open: "<em>", close: "</em>" },
  { label: "List", open: "<ul>\n  <li>", close: "</li>\n</ul>" },
  { label: "Quote", open: "<blockquote>", close: "</blockquote>" },
  { label: "Link", open: '<a href="https://">', close: "</a>" },
];

const BlogEditor = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState<"draft" | "published" | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [featuredPost, setFeaturedPost] = useState(false);
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [author, setAuthor] = useState("PPT Finder Editorial");

  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [removeFeaturedImage, setRemoveFeaturedImage] = useState(false);

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  // -------- Load existing blog when editing --------
  useEffect(() => {
    if (!isEditMode) return;

    const loadBlog = async () => {
      try {
        setLoading(true);
        const res = await getBlogByIdAdmin(id!);
        const blog = res.data?.data;

        if (!blog) {
          toast.error("Blog not found");
          navigate("/blogs");
          return;
        }

        setTitle(blog.title || "");
        setSlug(blog.slug || "");
        setSlugTouched(true);
        setFocusKeyword(blog.focusKeyword || "");
        setExcerpt(blog.excerpt || "");
        setContent(blog.content || "");
        setFeaturedPost(!!blog.featuredPost);
        setCategory(blog.category || "");
        setTags(Array.isArray(blog.tags) ? blog.tags.join(", ") : "");
        setAuthor(blog.author || "");
        setFeaturedImagePreview(blog.featuredImage || null);
        setMetaTitle(blog.metaTitle || "");
        setMetaDescription(blog.metaDescription || "");
        setMetaKeywords(blog.metaKeywords || "");
        setCanonicalUrl(blog.canonicalUrl || "");
      } catch (err) {
        console.error("Failed to load blog:", err);
        toast.error("Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id, isEditMode, navigate]);

  // -------- Auto-slug from title until the user edits slug manually --------
  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFeaturedImageFile(file);
    setFeaturedImagePreview(URL.createObjectURL(file));
    setRemoveFeaturedImage(false);
  };

  const handleRemoveImage = () => {
    setFeaturedImageFile(null);
    setFeaturedImagePreview(null);
    setRemoveFeaturedImage(true);
  };

  // -------- Content toolbar: wrap the current selection with HTML tags --------
  const insertTag = (open: string, close: string) => {
    const el = contentRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end);
    const next = content.slice(0, start) + open + selected + close + content.slice(end);

    setContent(next);

    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + open.length + selected.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  // -------- SEO checklist / score --------
  const keyword = focusKeyword.trim().toLowerCase();
  const seoChecks = [
    { label: "Focus keyword set", pass: !!keyword },
    { label: "Keyword in title", pass: !!keyword && title.toLowerCase().includes(keyword) },
    {
      label: "Keyword in meta description",
      pass: !!keyword && metaDescription.toLowerCase().includes(keyword),
    },
    { label: "Keyword in content", pass: !!keyword && content.toLowerCase().includes(keyword) },
  ];
  const seoScore = seoChecks.filter((c) => c.pass).length;
  const seoBadgeClass =
    seoScore >= 3
      ? "bg-green-100 text-green-700"
      : seoScore >= 1
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

  const slugPreview = slug ? `/blogs/${slug}` : "/blogs/your-slug";

  // -------- Save (draft or published) --------
  const handleSave = async (status: "draft" | "published") => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!content.trim()) {
      toast.error("Content is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    if (slug.trim()) formData.append("slug", slug.trim());
    formData.append("focusKeyword", focusKeyword);
    formData.append("excerpt", excerpt);
    formData.append("content", content);
    formData.append("featuredPost", String(featuredPost));
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("author", author);
    formData.append("metaTitle", metaTitle);
    formData.append("metaDescription", metaDescription);
    formData.append("metaKeywords", metaKeywords);
    formData.append("canonicalUrl", canonicalUrl);
    formData.append("status", status);

    if (featuredImageFile) {
      formData.append("featuredImage", featuredImageFile);
    } else if (removeFeaturedImage) {
      formData.append("removeFeaturedImage", "true");
    }

    try {
      setSaving(status);

      if (isEditMode) {
        await updateBlog(id!, formData);
        toast.success("Blog updated successfully");
      } else {
        await createBlog(formData);
        toast.success(
          status === "published" ? "Blog published successfully" : "Draft saved",
        );
      }

      navigate("/blogs");
    } catch (err: any) {
      console.error("Failed to save blog:", err);
      toast.error(err?.response?.data?.message || "Failed to save blog");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit article" : "New article"}
          </h1>
          <p className="text-sm text-gray-500">
            Write a search-friendly post with a focus keyword, meta tags, and a clean slug
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/blogs")} className="shrink-0">
          Back to blog
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* ---------------- LEFT COLUMN ---------------- */}
        <div className="space-y-6 min-w-0">
          {/* Title / Slug / Focus keyword */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="How to find free PowerPoint presentations for a seminar"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(slugify(e.target.value));
                    setSlugTouched(true);
                  }}
                  placeholder="your-slug"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
                />
                <p className="mt-1 text-xs text-gray-400 truncate">{slugPreview}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus keyword
                </label>
                <input
                  type="text"
                  value={focusKeyword}
                  onChange={(e) => setFocusKeyword(e.target.value)}
                  placeholder="free PowerPoint presentations"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
                />
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="A concise summary that can also work as the meta description."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 resize-y"
            />
            <p className="mt-1 text-xs text-gray-400">
              {excerpt.length}/160 recommended
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              {TOOLBAR_TAGS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insertTag(t.open, t.close)}
                  className="px-3 py-1.5 text-xs font-medium border rounded-lg hover:bg-gray-50"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              placeholder="Write the article in HTML. Use headings, lists, and internal links to relevant search pages."
              className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-blue-300 resize-y"
            />
          </div>
        </div>

        {/* ---------------- RIGHT COLUMN ---------------- */}
        <div className="space-y-6 min-w-0">
          {/* Publish */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Publish</h2>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${seoBadgeClass}`}>
                SEO {seoScore}
              </span>
            </div>

            <label className="flex items-center justify-between text-sm text-gray-700">
              Featured post
              <input
                type="checkbox"
                checked={featuredPost}
                onChange={(e) => setFeaturedPost(e.target.checked)}
                className="h-4 w-4"
              />
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. PowerPoint Tips"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="powerpoint, seminar, templates"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
              <p className="mt-1 text-xs text-gray-400">Comma-separated</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Editorial team"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={saving !== null}
                onClick={() => handleSave("draft")}
              >
                {saving === "draft" ? "Saving..." : "Save draft"}
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={saving !== null}
                onClick={() => handleSave("published")}
              >
                {saving === "published" ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-3">
            <div>
              <h2 className="font-semibold text-gray-900">Featured image</h2>
              <p className="text-xs text-gray-500">Use a 1200×630 image for Open Graph.</p>
            </div>

            <div className="border-2 border-dashed rounded-lg h-40 flex items-center justify-center overflow-hidden bg-gray-50">
              {featuredImagePreview ? (
                <img
                  src={featuredImagePreview}
                  alt="Featured"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm text-gray-400">No image selected</span>
              )}
            </div>

            <div className="flex gap-2">
              <label className="flex-1">
                <span className="block w-full text-center border rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                  Upload image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>
              {featuredImagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="border rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow p-4 md:p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">SEO</h2>

            <div className="rounded-lg border bg-gray-50 p-3 space-y-1 overflow-hidden">
              <p className="text-xs text-green-700 truncate">betogetherapp.com{slugPreview}</p>
              <p className="text-sm text-blue-700 font-medium truncate">
                {metaTitle || title || "Meta title preview"}
              </p>
              <p className="text-xs text-gray-500 line-clamp-2">
                {metaDescription || excerpt || "Meta description preview"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value.slice(0, 90))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
              <p className="mt-1 text-xs text-gray-400">{metaTitle.length}/70</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta description
              </label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value.slice(0, 200))}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300 resize-y"
              />
              <p className="mt-1 text-xs text-gray-400">{metaDescription.length}/160</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meta keywords
              </label>
              <input
                type="text"
                value={metaKeywords}
                onChange={(e) => setMetaKeywords(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Canonical URL
              </label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder={`betogetherapp.com${slugPreview}`}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
              />
            </div>

            <ul className="space-y-1.5 pt-1">
              {seoChecks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-xs">
                  <span
                    className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                      c.pass ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                  <span className={c.pass ? "text-gray-700" : "text-gray-400"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
