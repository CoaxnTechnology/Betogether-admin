import { useEffect, useState } from "react";
import { Users, UserCheck, Globe, Wallet, Eye, Trash2 } from "lucide-react";
import { getAllAmbassadors } from "../API/ambassadorApi";
import { useNavigate } from "react-router-dom";
const Ambassadors = () => {
  const token = localStorage.getItem("adminToken") || "";
  const navigate = useNavigate();
  const [ambassadors, setAmbassadors] = useState([]);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      const res = await getAllAmbassadors(token);

      setAmbassadors(res.data.ambassadors || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredAmbassadors = ambassadors.filter(
    (item: any) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalAmbassadors = ambassadors.length;

  const standardCount = ambassadors.filter(
    (a: any) => a.ambassadorType === "standard",
  ).length;

  const exclusiveCount = ambassadors.filter(
    (a: any) => a.ambassadorType === "exclusive",
  ).length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Ambassador Management</h1>

        <p className="text-gray-500">
          Manage ambassadors, commissions and territories
        </p>
      </div>

      {/* CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Ambassadors</p>

              <h2 className="text-3xl font-bold">{totalAmbassadors}</h2>
            </div>

            <Users size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Standard Ambassadors</p>

              <h2 className="text-3xl font-bold">{standardCount}</h2>
            </div>

            <UserCheck size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Exclusive Ambassadors</p>

              <h2 className="text-3xl font-bold">{exclusiveCount}</h2>
            </div>

            <Globe size={40} />
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <input
          type="text"
          placeholder="Search ambassador..."
          className="w-full border rounded-lg p-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Ambassador</th>

                <th className="p-4 text-left">Type</th>

                <th className="p-4 text-left">Territory</th>

                <th className="p-4 text-left">Commission</th>
                <th className="p-4 text-left">KPI</th>

                <th className="p-4 text-left">Wallet</th>

                <th className="p-4 text-left">Sub Ambassadors</th>

                <th className="p-4 text-left">Parent</th>

                <th className="p-4 text-left">Status</th>

                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredAmbassadors.map((item: any) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <div className="font-semibold">{item.name}</div>

                      <div className="text-sm text-gray-500">{item.email}</div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium
                        ${
                          item.ambassadorType === "exclusive"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {item.ambassadorType}
                    </span>
                  </td>

                  <td className="p-4">
                    {item.territory ? `${item.territory.city}` : "-"}
                  </td>

                  <td className="p-4">{item.commissionRate}%</td>
                  <td className="p-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${item.kpiProgress || 0}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs text-gray-500">
                      {item.kpiProgress || 0}%
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet size={16} />€{item.wallet?.balance || 0}
                    </div>
                  </td>

                  <td className="p-4">{item.subAmbassadorCount}</td>

                  <td className="p-4">{item.parentAmbassador?.name || "-"}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs
                        ${
                          item.ambassadorStatus === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                      {item.ambassadorStatus}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/ambassadors/${item._id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ambassadors;
