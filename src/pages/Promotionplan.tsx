import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";

interface Plan {
  _id: string;
  name: string;
  description: string;
  days: number;
  price: number;
}

export default function PromotionPlan() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  //////////////////////////////////////////////////
  // Fetch Plans
  //////////////////////////////////////////////////
  const fetchPlans = async () => {
    try {
      const res = await axios.get(
        "https://uat.api.betogetherapp.com/api/admin/promotion-plans"
      );
      const sorted = res.data.plans.sort(
        (a: Plan, b: Plan) => a.days - b.days
      );
      setPlans(sorted);
    } catch (err) {
      toast.error("Failed to fetch promotion plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  //////////////////////////////////////////////////
  // Reset Form
  //////////////////////////////////////////////////
  const resetForm = () => {
    setName("");
    setDescription("");
    setDays("");
    setPrice("");
    setEditingId(null);
  };

  //////////////////////////////////////////////////
  // Add / Update Plan
  //////////////////////////////////////////////////
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Plan name is required");
      return;
    }

    if (!days || !price) {
      toast.error("Days and price are required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `https://uat.api.betogetherapp.com/api/admin/promotion-plan/${editingId}`,
          { name, description, days, price }
        );
        toast.success("Promotion plan updated successfully ✅");
      } else {
        await axios.post(
          "https://uat.api.betogetherapp.com/api/admin/create-promotion-plan",
          { name, description, days, price }
        );
        toast.success("Promotion plan added successfully 🎉");
      }

      resetForm();
      fetchPlans();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to save promotion plan"
      );
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////
  // Edit
  //////////////////////////////////////////////////
  const handleEdit = (plan: Plan) => {
    setEditingId(plan._id);
    setName(plan.name);
    setDescription(plan.description || "");
    setDays(plan.days);
    setPrice(plan.price);
  };

  //////////////////////////////////////////////////
  // Delete (SweetAlert2)
  //////////////////////////////////////////////////
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Delete this plan?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://uat.api.betogetherapp.com/api/admin/promotion-plan/${id}`
      );
      toast.success("Promotion plan deleted 🗑️");
      fetchPlans();
    } catch (err) {
      toast.error("Failed to delete plan");
    }
  };

  //////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////
  return (
    <>
      {/* ✅ Toaster ONLY for this file */}
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
          <h1 className="text-2xl font-bold text-center mb-6">
            Promotion Plans Management
          </h1>

          {/* FORM */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Plan" : "Add New Plan"}
            </h2>

            {/* Name */}
            <input
              type="text"
              className="w-full border rounded-lg p-2 mb-2"
              placeholder="Plan name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Description */}
            <textarea
              className="w-full border rounded-lg p-2 mb-2"
              placeholder="Plan description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Days & Price */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <input
                type="number"
                className="border rounded-lg p-2"
                placeholder="Days"
                value={days}
                onChange={(e) =>
                  setDays(e.target.value ? Number(e.target.value) : "")
                }
              />
              <input
                type="number"
                className="border rounded-lg p-2"
                placeholder="Price (EUR)"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Plan"
                  : "Create Plan"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  className="flex-1 bg-gray-400 text-white py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* LIST */}
          <h2 className="text-lg font-semibold mb-4">Existing Plans</h2>

          {plans.length === 0 ? (
            <p className="text-gray-500">No plans available</p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-gray-50 p-4 rounded-xl mb-3 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-lg">{plan.name}</p>

                    {plan.description && (
                      <p className="text-gray-500 text-sm mt-1">
                        {plan.description}
                      </p>
                    )}

                    <p className="text-gray-600 mt-1">
                      {plan.days} Days — € {plan.price}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
