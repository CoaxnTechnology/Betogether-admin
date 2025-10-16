// src/pages/admin/Category.tsx
import React, { useEffect, useState } from "react";
import axios from "../API/baseUrl";
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";
import "react-toastify/dist/ReactToastify.css";

// ---------------- Types ----------------
interface Category {
  _id: string;
  name: string;
  image: string;
  tags: string[];
  created_at?: string;
}

// ---------------- Component ----------------
const CategoryPage: React.FC = () => {
  // -------- State --------
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [manualTag, setManualTag] = useState("");
  const [autoTags, setAutoTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // -------- Fetch categories --------
  const fetchCategories = async (page = 1, limit = recordsPerPage) => {
    try {
      const res = await axios.post("/category/all", { page, limit });
      if (res.data?.isSuccess) {
        const formattedCategories: Category[] = res.data.data.map(
          (cat: Category) => ({
            ...cat,
            tags: Array.isArray(cat.tags)
              ? cat.tags
              : typeof cat.tags === "string"
              ? JSON.parse(cat.tags)
              : [],
          })
        );
        setCategories(formattedCategories);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories(currentPage, recordsPerPage);
  }, [currentPage, recordsPerPage]);

  // -------- Tag handling --------
  const addManualTag = () => {
    const trimmed = manualTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setManualTag("");
      toast.info(`Tag "${trimmed}" added`);
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    toast.info(`Tag "${tag}" removed`);
  };

  // -------- Manual AI Tag Generation --------
  const handleGenerateAITags = async () => {
    if (!name.trim()) return toast.error("Enter category name first");

    try {
      setIsGeneratingTags(true);
      const res = await axios.post("/category/ai-tags", { text: name });
      if (res.data?.isSuccess && Array.isArray(res.data.tags)) {
        // Remove old AI-generated tags
        setTags((prev) => [
          ...prev.filter((t) => !autoTags.includes(t)),
          ...res.data.tags,
        ]);
        setAutoTags(res.data.tags);
        toast.success("AI tags generated");
      } else {
        setAutoTags([]);
        toast.error("No AI tags generated");
      }
    } catch (err) {
      console.error("AI Tag Generation Failed:", err);
      toast.error("Failed to generate AI tags");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  // -------- Image preview --------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // -------- Save (Create / Update) --------
  const handleSave = async () => {
    if (!name) return toast.error("Category name is required");
    if (tags.length === 0)
      return toast.error("Please provide at least one tag");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("tags", JSON.stringify(tags));
    if (image) formData.append("image", image);

    try {
      setIsLoading(true);
      let res;
      if (editingCategory) {
        res = await axios.put(
          `/category/update/${editingCategory._id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        if (res.data?.isSuccess) toast.success("Category updated successfully");
      } else {
        res = await axios.post("/category/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.isSuccess) toast.success("Category created successfully");
      }
      resetForm();
      fetchCategories(currentPage, recordsPerPage);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  // -------- Delete --------
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    try {
      const res = await axios.delete(`/category/delete/${id}`);
      if (res.data?.isSuccess) {
        toast.success("Category deleted successfully");
        fetchCategories(currentPage, recordsPerPage);
      }
    } catch {
      toast.error("Failed to delete category");
    }
  };

  // -------- Reset form --------
  const resetForm = () => {
    setName("");
    setImage(null);
    setPreview(null);
    setTags([]);
    setManualTag("");
    setAutoTags([]);
    setEditingCategory(null);
  };

  // -------- Edit --------
  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setTags(cat.tags || []);
    setImage(null);
    setPreview(cat.image);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // -------- Export --------
  const handleExport = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(categories, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "categories.json";
    a.click();
    toast.success("Categories exported successfully");
  };

  // -------- Render --------
  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen relative">
      {(isLoading || isGeneratingTags) && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* FORM SECTION */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-700 text-center md:text-left">
            {editingCategory ? "Edit Category" : "Create Category"}
          </h2>

          {/* Category Name + AI Button + Image Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Category name"
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-300 text-sm md:text-base"
              />
              <button
                onClick={handleGenerateAITags}
                disabled={isGeneratingTags}
                className="bg-purple-600 text-white px-0.5 py-0.5 rounded-lg hover:bg-purple-700 text-sm md:text-base"
              >
                {isGeneratingTags ? "Generating..." : "Generate AI Tags"}
              </button>
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="border rounded-lg px-4 py-2 w-full text-sm md:text-base"
            />
          </div>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="w-32 h-32 object-cover mt-2 rounded-lg"
            />
          )}

          {/* Tags */}
          <div>
            <label className="block font-medium mb-2 text-gray-700 text-sm md:text-base">
              Tags (Auto + Manual)
            </label>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-purple-200 text-purple-800 text-xs md:text-sm px-2 py-1 rounded-full flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 mb-3">
              <input
                type="text"
                value={manualTag}
                onChange={(e) => setManualTag(e.target.value)}
                placeholder="Type a tag and press Add"
                className="border rounded-lg px-4 py-2 flex-1 text-sm md:text-base"
              />
              <button
                onClick={addManualTag}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto text-sm md:text-base"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save / Cancel Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 w-full sm:w-auto text-sm md:text-base"
            >
              {isLoading
                ? "Saving..."
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </button>
            {editingCategory && (
              <button
                onClick={resetForm}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 w-full sm:w-auto text-sm md:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-blue-600 text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              📂 Category List
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 md:p-3 border">Image</th>
                  <th className="p-2 md:p-3 border">Name</th>
                  <th className="p-2 md:p-3 border">Tags</th>
                  <th className="p-2 md:p-3 border text-center">Created At</th>
                  <th className="p-2 md:p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-gray-50">
                      <td className="p-2 md:p-3 border">
                        <img
                          src={
                            cat.image ||
                            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                          }
                          alt={cat.name}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover mx-auto"
                        />
                      </td>
                      <td className="p-2 md:p-3 border font-medium text-center md:text-left">
                        {cat.name}
                      </td>
                      <td className="p-2 md:p-3 border text-gray-600 text-center md:text-left">
                        {cat.tags?.length ? (
                          <div className="flex flex-wrap justify-center md:justify-start gap-1 md:gap-2">
                            {cat.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        {cat.created_at
                          ? new Date(cat.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-2 md:p-3 border text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
                            className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-4 text-gray-500 border"
                    >
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-3 border-t bg-gray-50 text-sm">
            <div className="flex items-center gap-2">
              <label>Rows per page:</label>
              <select
                value={recordsPerPage}
                onChange={(e) => {
                  setRecordsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="border-blue-800 hover:bg-blue-100 text-sm"
              >
                Prev
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="border-blue-800 hover:bg-blue-100 text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
