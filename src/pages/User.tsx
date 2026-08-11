import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";
import axios from "../API/baseUrl"; // ✅ your axios instance
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import {
  makeAmbassador,
  removeAmbassador,
  getAllAmbassadors,
} from "../API/ambassadorApi";
import { getTerritories } from "../API/territoryApi";
interface UserType {
  _id: string;
  name?: string;
  email?: string;
  mobile?: string | null;
  status?: string;
  profile_image?: string | null;
  created_at?: string;
  isAmbassador?: boolean;
  ambassadorStatus?: string;
  hasPendingInvitation?: boolean;
}
interface Territory {
  _id: string;
  city: string;
  country: string;
}

interface Ambassador {
  _id: string;
  name: string;
  ambassadorType: string;
}

export default function User() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmbassadorModal, setShowAmbassadorModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [ambassadorType, setAmbassadorType] = useState<
    "standard" | "exclusive"
  >("standard");

  const [commissionRate, setCommissionRate] = useState(3);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const [removeErrorMessage, setRemoveErrorMessage] = useState("");

  const [selectedAmbassador, setSelectedAmbassador] = useState<UserType | null>(
    null,
  );
  const [territoryIds, setTerritoryIds] = useState<string[]>([]);

  const [parentAmbassadorId, setParentAmbassadorId] = useState("");
  const [territories, setTerritories] = useState<Territory[]>([]);

  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const territoryOptions = territories.map((t) => ({
    value: t._id,
    label: `${t.city} (${t.country})`,
  }));
  // Helper to safely display field values
  const displayValue = (val?: string | null) =>
    val && val.trim() !== "" && val !== "null" ? val : "N/A";
  const loadDropdownData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log("loadDropdownData: start");

      if (!token) {
        console.log("loadDropdownData: no adminToken found");
        return;
      }

      console.log("loadDropdownData: adminToken found", token);

      const territoryRes = await getTerritories(token);

      setTerritories(territoryRes.data?.territories || []);

      const ambassadorRes = await getAllAmbassadors(token);

      setAmbassadors(ambassadorRes.data?.ambassadors || []);

      console.log(
        "loadDropdownData: territories loaded",
        territoryRes.data?.territories,
        "ambassadors loaded",
        ambassadorRes.data?.ambassadors,
      );
    } catch (err) {
      console.error("loadDropdownData error:", err);
    }
  };
  const fetchUsers = async (showToast = false) => {
    try {
      setLoading(true);
      console.log("fetchUsers: fetching users, showToast=", showToast);

      const res = await axios.get("/alluser");

      if (res.data.success) {
        console.log("fetchUsers: success, users count=", res.data.data?.length);
        setUsers(res.data.data);
        setCurrentPage(1);

        if (showToast) {
          toast.success("Users fetched successfully");
        }
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
    }
  };
  // Fetch users from API
  useEffect(() => {
    console.log("User component mounted");
    fetchUsers(true);

    loadDropdownData();

    const interval = setInterval(() => {
      console.log("User component periodic refresh: fetching users");
      fetchUsers(false);
    }, 20 * 60 * 1000);

    return () => {
      console.log("User component unmounted: clearing interval");
      clearInterval(interval);
    };
  }, []);

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = users.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(users.length / recordsPerPage);
  const [search, setSearch] = useState("");
  // Export Excel
  const exportToExcel = () => {
    try {
      console.log("exportToExcel: exporting", users.length, "users");
      const dataForExport = users.map(({ profile_image, ...rest }) => rest);
      const worksheet = XLSX.utils.json_to_sheet(dataForExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const data = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(data, "Users_List.xlsx");
      toast.success("Excel exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export Excel");
    }
  };
  const handleToggleUser = async (user: UserType) => {
    const isBlocked = user.status === "banned";
    console.log("handleToggleUser: user", user._id, "isBlocked", isBlocked);

    const confirmAction = window.confirm(
      isBlocked
        ? "Are you sure you want to UNBLOCK this user?"
        : "Are you sure you want to BLOCK this user? This will log them out from all devices.",
    );

    if (!confirmAction) return;

    try {
      const url = isBlocked ? "/unblock-user" : "/block-user";

      const res = await axios.post(url, {
        userId: user._id,
      });

      console.log("handleToggleUser: response", res.data);

      if (res.data.success) {
        toast.success(
          isBlocked
            ? "User unblocked successfully"
            : "User blocked successfully",
        );

        // 🔥 Instant UI update
        await fetchUsers();
      } else {
        toast.error(res.data.message || "Action failed");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Unable to remove ambassador";

      setRemoveErrorMessage(message);

      setShowRemoveModal(true);
    }
  };
  const handleToggleAmbassador = async (user: UserType) => {
    try {
      console.log("handleToggleAmbassador: remove ambassador for user", user._id);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        toast.error("Admin token missing");
        return;
      }

      const response = await removeAmbassador(user._id, token);
      console.log("handleToggleAmbassador: response", response.data);

      if (response.data.isSuccess) {
        toast.success("Ambassador removed");

        await fetchUsers();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  const handleClearSearch = async () => {
    console.log("handleClearSearch: clearing search and reloading users");
    setSearch("");
    setCurrentPage(1);

    await fetchUsers();
  };
  const handleCreateAmbassador = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      console.log(
        "handleCreateAmbassador: selectedUser",
        selectedUser?._id,
        "type",
        ambassadorType,
      );

      if (!selectedUser || !token) return;
      if (
        ambassadorType === "exclusive" &&
        territoryIds.length === 0
      ) {
        toast.error("Please select at least one territory");
        return;
      }

      if (ambassadorType === "standard" && !parentAmbassadorId) {
        toast.error("Please select parent ambassador");
        return;
      }
      const payload = {
        ambassadorType,
        commissionRate,

        territoryIds: ambassadorType === "exclusive" ? territoryIds : undefined,

        parentAmbassadorId:
          ambassadorType === "standard" ? parentAmbassadorId : undefined,
      };

      const res = await makeAmbassador(selectedUser._id, payload, token);
      console.log("handleCreateAmbassador: response", res.data);

      if (res.data.isSuccess) {
        toast.success("Ambassador invitation sent successfully");

        setShowAmbassadorModal(false);



        await fetchUsers();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };
  // Loader overlay
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  const handleSearch = async () => {
    try {
      setLoading(true);
      console.log("handleSearch: keyword", search);

      if (!search.trim()) {
        console.log("handleSearch: search empty, reloading all users");
        await fetchUsers();
        return;
      }

      const url = `/admin/search-users?keyword=${encodeURIComponent(search)}`;
      console.log("handleSearch: calling search API", {
        url,
        method: "GET",
        keyword: search,
      });

      const res = await axios.get(url);
      console.log("handleSearch: search API response", res.data);

      if (res.data.success) {
        console.log("handleSearch: results count=", res.data.data?.length);
        setUsers(res.data.data);
        setCurrentPage(1); // reset pagination
        toast.success("Search completed");
      } else {
        console.log("handleSearch: search API returned success=false", res.data);
        toast.error("Search failed");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      console.log("handleSearch: error response", err?.response?.data || err);
      toast.error("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-6 bg-gray-50 min-h-screen relative">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <div className="border rounded-lg shadow bg-white">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-blue-500 text-white p-3 md:p-4 rounded-t-lg gap-3">
          <h2 className="font-semibold flex items-center gap-2 text-base md:text-lg">
            <span className="text-lg md:text-xl">👥</span> Users List
          </h2>

          <button
            onClick={() => {
              console.log("export button clicked");
              exportToExcel();
            }}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm px-3 py-1 md:px-4 md:py-2 rounded"
          >
            Export
          </button>
        </div>
        <div className="flex flex-col md:flex-row justify-end items-center gap-2 p-3 bg-gray-50 border-b">
          <input
            type="text"
            placeholder="Search by name, email, city, age..."
            value={search}
            onChange={(e) => {
              console.log("search input changed", e.target.value);
              setSearch(e.target.value);
            }}
            className="border border-gray-300 rounded-md p-2 text-sm w-64"
          />

          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2"
          >
            Search
          </Button>
          <Button
            onClick={handleClearSearch}
            className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-4 py-2"
          >
            Clear
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Image</th>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Email</th>
                <th className="p-2 border">Mobile</th>
                <th className="p-2 border">Status</th>

                {/* NEW COLUMN */}
                <th className="p-2 border">Ambassador</th>

                <th className="p-2 border">Created At</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((user, i) => (
                <tr
                  key={user._id}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="p-2 border">
                    <img
                      src={
                        user.profile_image ||
                        "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                      }
                      alt={displayValue(user.name)}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="p-2 border">{displayValue(user.name)}</td>
                  <td className="p-2 border">{displayValue(user.email)}</td>
                  <td className="p-2 border">{displayValue(user.mobile)}</td>
                  <td className="p-2 border">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${user.status === "active"
                        ? "bg-green-200 text-green-700"
                        : "bg-red-100 text-red-700"
                        }`}
                    >
                      {displayValue(user.status)}
                    </span>
                  </td>

                  <td className="p-2 border">
                    {user.isAmbassador ? (
  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
    Ambassador
  </span>
) : user.hasPendingInvitation ? (
  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">
    Invitation Pending
  </span>
) : (
  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
    User
  </span>
)}
                  </td>
                  <td className="p-2 border">
                    {user.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-2 border">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          console.log("view user clicked", user._id);
                          navigate(`/users/${user._id}`);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleToggleUser(user)}
                        className={`text-white text-xs px-3 py-1 rounded ${user.status === "banned"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-500 hover:bg-red-600"
                          }`}
                      >
                        {user.status === "banned" ? "Unblock" : "Block"}
                      </Button>
                      {user.isAmbassador ? (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            setSelectedAmbassador(user);
                            handleToggleAmbassador(user);
                          }}
                        >
                          Remove Ambassador
                        </Button>
                      ) : user.hasPendingInvitation ? (
                        <Button
                          disabled
                          className="bg-yellow-500 hover:bg-yellow-500 text-white cursor-not-allowed"
                        >
                          Invitation Sent
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            console.log("send invitation button clicked", user._id);
                            setSelectedUser(user);
                            setShowAmbassadorModal(true);
                          }}
                        >
                          Send Invitation
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {showAmbassadorModal && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-xl w-[500px]">
                <h2 className="text-xl font-bold mb-4">Make Ambassador</h2>

                <label>Ambassador Type</label>

                <select
                  value={ambassadorType}
                  onChange={(e) => {
                    console.log("ambassadorType changed", e.target.value);
                    setAmbassadorType(e.target.value as any);
                  }}
                  className="border p-2 w-full mb-3"
                >
                  <option value="standard">Standard</option>

                  <option value="exclusive">Exclusive</option>
                </select>

                <label>Commission %</label>

                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => {
                    console.log("commissionRate changed", e.target.value);
                    setCommissionRate(Number(e.target.value));
                  }}
                  className="border p-2 w-full mb-3"
                />

                {ambassadorType === "exclusive" && (
                  <>
                    <label className="block mb-2 font-medium">
                      Territories
                    </label>

                    <Select
                      isMulti
                      options={territoryOptions}
                      placeholder="Search and select territories..."
                      value={territoryOptions.filter((option) =>
                        territoryIds.includes(option.value)
                      )}
                      onChange={(selected) =>
                        setTerritoryIds(
                          selected
                            ? selected.map((item) => item.value)
                            : []
                        )
                      }
                    />
                  </>
                )}

                {ambassadorType === "standard" && (
                  <>
                    <label>Parent Ambassador</label>

                    <select
                      value={parentAmbassadorId}
                      onChange={(e) => {
                        console.log("parentAmbassadorId changed", e.target.value);
                        setParentAmbassadorId(e.target.value);
                      }}
                      className="border p-2 w-full mb-3"
                    >
                      <option value="">None</option>

                      {ambassadors
                        .filter((a) => a.ambassadorType === "exclusive")
                        .map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.name}
                          </option>
                        ))}
                    </select>
                  </>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      console.log("ambassador modal cancel clicked");
                      setShowAmbassadorModal(false);
                    }}
                    className="border px-4 py-2 rounded"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => {
                      console.log("ambassador modal send invitation clicked");
                      handleCreateAmbassador();
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded"
                  >
                    Send Invitation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2 text-sm">
            <label>Rows per page:</label>
            <select
              value={recordsPerPage}
              onChange={(e) => {
                console.log("recordsPerPage changed", e.target.value);
                setRecordsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => {
                console.log("pagination prev clicked", currentPage);
                setCurrentPage((p) => p - 1);
              }}
              className="text-black-700 border-blue-800 hover:bg-blue-500 text-sm"
            >
              Prev
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => {
                console.log("pagination next clicked", currentPage);
                setCurrentPage((p) => p + 1);
              }}
              className="text-black-700 border-blue-800 hover:bg-blue-500 text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
      {showRemoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[500px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-bold text-red-600">
              Cannot Remove Ambassador
            </h2>

            <p className="mb-6 text-gray-600">{removeErrorMessage}</p>

            <div className="flex justify-end">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
