import { useEffect, useState } from "react";
import axios from "axios";

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
        "https://uat.api.betogetherapp.com/api/admin/promotion-plans",
      );
      const sorted = res.data.plans.sort((a: Plan, b: Plan) => a.days - b.days);
      setPlans(sorted);
    } catch (err) {
      console.error("Error fetching plans");
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
      alert("Plan name is required");
      return;
    }

    if (!days || !price) {
      alert("Days and Price required");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `https://uat.api.betogetherapp.com/api/admin/promotion-plan/${editingId}`,
          {
            name,
            description,
            days,
            price,
          },
        );
      } else {
        await axios.post(
          "https://uat.api.betogetherapp.com/api/admin/create-promotion-plan",
          {
            name,
            description,
            days,
            price,
          },
        );
      }

      resetForm();
      fetchPlans();
    } catch (err) {
      alert("Error saving plan");
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
  // Delete
  //////////////////////////////////////////////////
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this plan?")) return;
    await axios.delete(
      `https://uat.api.betogetherapp.com/api/admin/promotion-plan/${id}`,
    );
    fetchPlans();
  };

  return (
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
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter plan name"
            />
          </div>

          {/* Description */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-lg p-2"
              placeholder="Enter plan description"
            />
          </div>

          {/* Days & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) =>
                  setDays(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Price (EUR)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full border rounded-lg p-2"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
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
        <div>
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
                    <p className="text-gray-600">
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
    </div>
  );
}
