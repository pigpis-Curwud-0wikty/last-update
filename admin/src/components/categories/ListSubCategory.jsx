import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../../App";

const ListSubCategory = ({
  token,
  categories,
  setActiveTab,
  handleEditSubCategory,
  handleViewSubCategory,
}) => {
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState(""); // "", "true", "false"
  const [isDeleted, setIsDeleted] = useState(""); // "", "true", "false"
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const [subcategories, setSubCategories] = useState([]);

  // ✅ Fetch SubCategories with detailed error handling
  const fetchSubCategories = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/subcategories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          key: search || undefined,
          isActive: isActive === "" ? undefined : isActive === "true",
          includeDeleted: isDeleted === "" ? undefined : isDeleted === "true",
          page,
          pageSize,
        },
      });

      console.log("📦 Subcategories full response:", res);

      // ✅ Check if responseBody موجود
      if (!res.data || !res.data.responseBody) {
        console.error("❌ responseBody is missing in API response:", res.data);
        toast.error("API response format is invalid");
        return;
      }

      const subCats = res.data.responseBody.data || [];

      // ✅ Handle if no data
      if (!Array.isArray(subCats)) {
        console.error("❌ Expected 'data' to be an array, got:", subCats);
        toast.error("Subcategories data is not an array");
        return;
      }

      const totalCount =
        res.data.responseBody.totalCount ||
        res.data.responseBody.pagination?.totalItems ||
        subCats.length;

      // ✅ Normalize image + deleted flag
      const normalized = subCats.map((sc) => {
        let mainImg =
          sc.mainImage ||
          sc.images?.find((i) => i.isMain) ||
          sc.images?.[0] ||
          null;

        let imgUrl = null;
        if (mainImg) {
          if (mainImg.url) {
            imgUrl = mainImg.url.startsWith("http")
              ? mainImg.url
              : `${backendUrl}/${mainImg.url}`;
          } else if (mainImg.filePath) {
            imgUrl = `${backendUrl}/${mainImg.filePath}`;
          } else if (mainImg.imageName) {
            imgUrl = `${backendUrl}/uploads/${mainImg.imageName}`;
          }
        }

        return {
          ...sc,
          mainImage: mainImg,
          mainImageUrl: imgUrl,
          deleted: !!sc.deletedAt, // 👈 لو عنده deletedAt يبقى متشال
        };
      });

      console.log("✅ Normalized Subcategories:", normalized);

      setSubCategories(normalized);
      setTotalPages(Math.ceil(totalCount / pageSize));
    } catch (error) {
      if (error.response) {
        // ❌ Error from API
        console.error(
          "❌ API Error:",
          error.response.status,
          error.response.data
        );
        toast.error(
          `API Error: ${error.response.data?.message || "Unknown error"}`
        );
      } else if (error.request) {
        // ❌ No response from server
        console.error("❌ No response received:", error.request);
        toast.error("No response from server");
      } else {
        // ❌ Other errors (frontend/JS)
        console.error("❌ Error in request setup:", error.message);
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    if (token) fetchSubCategories();
  }, [token, search, isActive, isDeleted, page, pageSize]);

  // ✅ Delete SubCategory
  const removeSubCategory = async (id) => {
    try {
      const res = await axios.delete(`${backendUrl}/api/subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ عدل حالة العنصر بدل ما تشيله من الليستة
      setSubCategories((prev) =>
        prev.map((sc) => (sc.id === id ? { ...sc, deleted: true } : sc))
      );

      const okMsg =
        res?.data?.responseBody?.message ||
        res?.data?.message ||
        (typeof res?.data === "string" ? res.data : null) ||
        "Sub-category deleted successfully";
      toast.success(okMsg);
    } catch (error) {
      const errData = error.response?.data;
      const apiMsg =
        errData?.responseBody?.message ||
        errData?.message ||
        error.message ||
        "Failed to delete sub-category";

      if (errData?.responseBody?.message?.includes("already deleted")) {
        // ✅ علّم برضه إنه متشال
        setSubCategories((prev) =>
          prev.map((sc) => (sc.id === id ? { ...sc, deleted: true } : sc))
        );
        toast.info(apiMsg);
      } else {
        toast.error(apiMsg);
      }
    }
  };

  // ✅ Activate SubCategory
  const activateSubCategory = async (subCat) => {
    if (!subCat.mainImageUrl) return toast.error("Upload a main image first!");

    try {
      const res = await axios.patch(
        `${backendUrl}/api/subcategories/${subCat.id}/activate`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json", // أو text/plain حسب الـ API
          },
        }
      );

      const msg =
        res?.data?.responseBody?.message ||
        res?.data?.message ||
        "Sub-category activated ✅";
      toast.success(msg);
      fetchSubCategories();
    } catch (err) {
      if (err.response) {
        console.error("❌ Error Response:", err.response.data);
        console.error("❌ Status:", err.response.status);
        console.error("❌ Headers:", err.response.headers);

        const msg =
          err.response.data?.responseBody?.message ||
          err.response.data?.message ||
          "Activation failed";
        toast.error(msg);
      } else if (err.request) {
        console.error("❌ No response received:", err.request);
        toast.error("No response from server");
      } else {
        console.error("❌ Request setup error:", err.message);
        toast.error("Request error");
      }
    }
  };

  // ✅ Deactivate SubCategory
  const deactivateSubCategory = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/subcategories/${id}/deactivate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msg =
        res?.data?.responseBody?.message ||
        res?.data?.message ||
        "Sub-category deactivated ❌";
      toast.success(msg);
      fetchSubCategories();
    } catch (err) {
      const emsg =
        err?.response?.data?.responseBody?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Deactivation failed";
      toast.error(emsg);
    }
  };

  // ✅ Restore Deleted SubCategory
  const restoreSubCategory = async (id) => {
    try {
      const res = await axios.patch(
        `${backendUrl}/api/subcategories/${id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const msg =
        res?.data?.responseBody?.message ||
        res?.data?.message ||
        "Sub-category restored ✅";
      toast.success(msg);
      fetchSubCategories();
    } catch {
      toast.error("Restore failed");
    }
  };

  // ✅ Get Parent Category Name
  const getParentCategoryName = (categoryId) => {
    const parent = categories.find((cat) => cat.id === categoryId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sub-Categories List</h2>

      <button
        onClick={() => setActiveTab("add-sub")}
        className="bg-green-500 text-white px-4 py-2 rounded mb-4"
      >
        Add New Sub-Category
      </button>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search sub-categories..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded w-60"
        />
        <select
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All (Active/Inactive)</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={isDeleted}
          onChange={(e) => {
            setIsDeleted(e.target.value);
            setPage(1);
          }}
          className="border px-3 py-2 rounded"
        >
          <option value="">All (Deleted/Not Deleted)</option>
          <option value="true">Deleted</option>
          <option value="false">Not Deleted</option>
        </select>
      </div>

      {/* Sub-category cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subcategories.length === 0 ? (
          <p className="text-gray-500">No sub-categories found.</p>
        ) : (
          subcategories.map((subCat) => (
            <div
              key={subCat.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition bg-white"
            >
              {/* ✅ Show Image */}
              {subCat.mainImageUrl ? (
                <img
                  src={subCat.mainImageUrl}
                  alt={subCat.name}
                  className="w-full h-40 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 flex items-center justify-center rounded mb-3 text-gray-500">
                  No Image
                </div>
              )}

              {/* ✅ Name */}
              <h3 className="font-semibold text-lg mb-1">{subCat.name}</h3>

              {/* ✅ Description */}
              <p className="text-sm text-gray-600 mb-2">
                {subCat.description || "No description available"}
              </p>

              {/* ✅ Status */}
              <p
                className={`text-xs font-medium mb-1 ${
                  subCat.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {subCat.isActive ? "Active ✅" : "Inactive ❌"}
              </p>
              <p
                className={`text-xs font-medium mb-3 ${
                  subCat.deleted ? "text-gray-500" : "text-blue-600"
                }`}
              >
                {subCat.deleted ? "Deleted 🗑️" : "Not Deleted"}
              </p>

              {/* ✅ Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewSubCategory(subCat);
                  }}
                  className="bg-purple-500 text-white px-3 py-1 rounded"
                >
                  View
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSubCategory(subCat);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(subCat.id);
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                {subCat.isActive ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deactivateSubCategory(subCat.id);
                    }}
                    className="bg-yellow-500 text-white px-3 py-1 rounded"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      activateSubCategory(subCat);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Activate
                  </button>
                )}
                {subCat.deleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      restoreSubCategory(subCat.id);
                    }}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-3 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(1);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value={5}>5 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[350px]">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this sub-category?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => removeSubCategory(deleteId)}
                disabled={deleteLoading}
                className={`px-4 py-2 ${
                  deleteLoading ? "bg-red-300" : "bg-red-500 hover:bg-red-600"
                } text-white rounded-md`}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListSubCategory;
