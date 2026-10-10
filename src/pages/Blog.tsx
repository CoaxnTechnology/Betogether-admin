import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { deleteBlog, getAllBlogsAdmin } from "../api/blog.api";

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  status: "draft" | "published";
  featuredPost?: boolean;
  featuredImage?: string | null;
  createdAt?: string;
}

const statusBadge = (status: string) =>
  status === "published"
    ? "bg-green-100 text-green-700"
    : "bg-yellow-100 text-yellow-700";

const BlogPage = () => {
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | "draft" | "published">("");

  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await getAllBlogsAdmin({
        status: status || undefined,
        search: search || undefined,
        page: currentPage,
        limit: recordsPerPage,
      });

      setBlogs(res.data?.data || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, status]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBlogs();
  };

  const handleDelete = async (blog: BlogItem) => {
    const result = await Swal.fire({
      title: "Delete this article?",
      text: `"${blog.title}" will be permanently deleted, including its featured image.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteBlog(blog._id);
      toast.success("Blog deleted successfully");
      fetchBlogs();
    } catch (err) {
      console.error("Failed to delete blog:", err);
      toast.error("Failed to delete blog");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-sm text-gray-500">Manage articles shown on the website</p>
        </div>
        <Button onClick={() => navigate("/blogs/new")} className="bg-blue-600 hover:bg-blue-700 shrink-0">
          + New article
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
          <div className="flex flex-1 gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search by title, slug, or focus keyword..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
            />
            <Button variant="outline" onClick={handleSearch}>
              Search
            </Button>
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as "" | "draft" | "published");
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Image</th>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Created</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <img
                          src={blog.featuredImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                          alt={blog.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </td>
                      <td className="p-3 font-medium text-gray-800 max-w-[280px]">
                        <span className="line-clamp-2">{blog.title}</span>
                      </td>
                      <td className="p-3 text-gray-600">{blog.category || "-"}</td>
                      <td className="p-3 text-center">
                        {blog.featuredPost ? (
                          <span className="text-yellow-500">★</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBadge(blog.status)}`}
                        >
                          {blog.status}
                        </span>
                      </td>
                      <td className="p-3 text-center text-gray-500">
                        {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(blog)}
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
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No articles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center gap-3 p-3 border-t bg-gray-50 text-sm">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
