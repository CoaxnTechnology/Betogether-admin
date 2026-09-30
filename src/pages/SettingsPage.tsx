import { useEffect, useState } from "react";
import client from "../api/client";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Settings, Percent, XCircle, Wallet, Megaphone, Pencil, Trash2 } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ==========================================================
// COMMISSION + CANCELLATION TAB  (moved out of Payment.tsx)
// ==========================================================
const CommissionCancellationTab = () => {
  const [providerCommission, setProviderCommission] = useState("");
  const [customerCommission, setCustomerCommission] = useState("");
  const [savedProviderCommission, setSavedProviderCommission] = useState("");
  const [savedCustomerCommission, setSavedCustomerCommission] = useState("");

  const [cancellationEnabled, setCancellationEnabled] = useState(false);
  const [cancellationPercentage, setCancellationPercentage] = useState("");
  const [savedCancellation, setSavedCancellation] = useState("");

  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const [commissionRes, cancelRes] = await Promise.all([
        client.get("/commission"),
        client.get("/cancellation"),
      ]);

      const providerValue =
        commissionRes.data?.providerCommissionPercentage ?? "";
      const customerValue =
        commissionRes.data?.customerCommissionPercentage ?? "";

      setProviderCommission(providerValue.toString());
      setCustomerCommission(customerValue.toString());
      setSavedProviderCommission(providerValue.toString());
      setSavedCustomerCommission(customerValue.toString());

      setCancellationEnabled(cancelRes.data?.enabled || false);

      const cancelValue =
        cancelRes.data?.percentage === 0 ||
        cancelRes.data?.percentage === undefined
          ? ""
          : cancelRes.data.percentage.toString();

      setCancellationPercentage(cancelValue);
      setSavedCancellation(cancelValue);
    } catch (error) {
      toast.error("Failed to load settings ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCommissionSave = async () => {
    try {
      await client.put("/commission", {
        providerCommissionPercentage: Number(providerCommission),
        customerCommissionPercentage: Number(customerCommission),
      });
      fetchSettings();
      toast.success("Commission updated ✅");
    } catch (err) {
      toast.error("Error updating commission ❌");
    }
  };

  const handleCancellationSave = async () => {
    try {
      await client.put("/cancellation", {
        enabled: cancellationEnabled,
        percentage: cancellationEnabled
          ? Number(cancellationPercentage)
          : null,
      });
      fetchSettings();
      toast.success("Cancellation setting updated ✅");
    } catch (err) {
      toast.error("Error updating cancellation setting ❌");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
      {/* COMMISSION CARD */}
      <div className="bg-white shadow-sm rounded-2xl p-8 space-y-5 border border-slate-200">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Percent className="h-5 w-5 text-blue-600" /> Commission Percentage
        </h3>
        <p className="text-sm text-slate-500">
          Applied to every booking — provider's cut is reduced by this %,
          customer pays this % on top.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Provider Commission %
            </label>
            <input
              type="number"
              placeholder="e.g. 8"
              value={providerCommission}
              onChange={(e) => setProviderCommission(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Customer Commission %
            </label>
            <input
              type="number"
              placeholder="e.g. 4"
              value={customerCommission}
              onChange={(e) => setCustomerCommission(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleCommissionSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-medium transition"
        >
          Save Commission
        </button>

        <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
          Currently saved: <b className="text-slate-700">{savedProviderCommission || "-"}%</b> provider ·{" "}
          <b className="text-slate-700">{savedCustomerCommission || "-"}%</b> customer
        </div>
      </div>

      {/* CANCELLATION CARD */}
      <div className="bg-white shadow-sm rounded-2xl p-8 space-y-5 border border-slate-200">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <XCircle className="h-5 w-5 text-rose-600" /> Cancellation Charges
        </h3>
        <p className="text-sm text-slate-500">
          Fee deducted from a customer-initiated cancellation refund.
        </p>

        <label className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={cancellationEnabled}
            onChange={(e) => setCancellationEnabled(e.target.checked)}
            className="cursor-pointer h-4 w-4"
          />
          Enable cancellation charges
        </label>

        {cancellationEnabled && (
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Cancellation %
            </label>
            <input
              type="number"
              placeholder="Enter cancellation %"
              value={cancellationPercentage}
              onChange={(e) => setCancellationPercentage(e.target.value)}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        <button
          onClick={handleCancellationSave}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-medium transition"
        >
          Save Cancellation Setting
        </button>

        <div className="pt-3 border-t border-slate-100 text-sm text-slate-500">
          Currently saved:{" "}
          <b className="text-slate-700">
            {savedCancellation ? `${savedCancellation}%` : "Disabled"}
          </b>
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// WALLET CONFIG TAB  (moved out of WalletConfigPage.tsx)
// ==========================================================
interface WalletConfig {
  _id?: string;
  inviterBonus: number | "";
  invitedBonus: number | "";
  maxWalletUsagePercent: number | "";
  coinToCurrencyValue: number | "";
  currency: string;
}

const WalletConfigTab = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState<WalletConfig>({
    inviterBonus: "",
    invitedBonus: "",
    maxWalletUsagePercent: "",
    coinToCurrencyValue: "",
    currency: "",
  });

  const getWalletConfig = async () => {
    try {
      setLoading(true);
      const res = await client.get("/wallet-config");

      if (res.data?.data?._id) {
        setConfig({
          ...res.data.data,
          inviterBonus:
            res.data.data.inviterBonus ?? res.data.data.inviterReward ?? "",
          invitedBonus:
            res.data.data.invitedBonus ?? res.data.data.invitedReward ?? "",
          maxWalletUsagePercent: res.data.data.maxWalletUsagePercent ?? "",
          coinToCurrencyValue: res.data.data.coinToCurrencyValue ?? "",
          currency: res.data.data.currency ?? "",
        });
      }
    } catch (err) {
      // silent — page starts empty if no config exists yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWalletConfig();
  }, []);

  const validateConfig = () => {
    const numericFields = [
      { key: "inviterBonus", label: "Inviter Bonus" },
      { key: "invitedBonus", label: "Invited Bonus" },
      { key: "maxWalletUsagePercent", label: "Max Wallet Usage %" },
      { key: "coinToCurrencyValue", label: "1 Coin Value" },
    ];

    const invalidFields: string[] = [];

    numericFields.forEach(({ key, label }) => {
      const value = config[key as keyof WalletConfig];
      if (value === "" || value === null) {
        invalidFields.push(`${label} is required`);
      } else if (Number(value) <= 0) {
        invalidFields.push(`${label} must be greater than 0`);
      }
    });

    if (config.currency.trim() === "") {
      invalidFields.push("Currency is required");
    }

    return { isValid: invalidFields.length === 0, invalidFields };
  };

  const saveConfig = async () => {
    try {
      const { isValid, invalidFields } = validateConfig();
      if (!isValid) {
        toast.error(invalidFields.join(", "));
        return;
      }

      setSaving(true);

      if (config._id) {
        await client.put(`/wallet-config/${config._id}`, config);
        toast.success("Wallet config updated ✅");
      } else {
        const res = await client.post("/wallet-config", config);
        setConfig({
          ...res.data.data,
          inviterBonus:
            res.data.data.inviterBonus ?? res.data.data.inviterReward ?? "",
          invitedBonus:
            res.data.data.invitedBonus ?? res.data.data.invitedReward ?? "",
          maxWalletUsagePercent: res.data.data.maxWalletUsagePercent ?? "",
          coinToCurrencyValue: res.data.data.coinToCurrencyValue ?? "",
          currency: res.data.data.currency ?? "",
        });
        toast.success("Wallet config created ✅");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Something went wrong ❌");
    } finally {
      setSaving(false);
    }
  };

  const deleteConfig = async () => {
    try {
      if (!config._id) return;

      await client.delete(`/wallet-config/${config._id}`);

      setConfig({
        inviterBonus: "",
        invitedBonus: "",
        maxWalletUsagePercent: "",
        coinToCurrencyValue: "",
        currency: "",
      });

      toast.success("Wallet config deleted ✅");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed ❌");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-6 max-w-3xl">
      <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200 space-y-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
            <Wallet className="h-5 w-5 text-violet-600" /> Wallet & Referral Config
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Referral bonuses, wallet usage cap and coin-to-currency value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Inviter Bonus
            </label>
            <input
              type="number"
              value={config.inviterBonus}
              onChange={(e) =>
                setConfig({
                  ...config,
                  inviterBonus: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Invited Bonus
            </label>
            <input
              type="number"
              value={config.invitedBonus}
              onChange={(e) =>
                setConfig({
                  ...config,
                  invitedBonus: e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Max Wallet Usage %
            </label>
            <input
              type="number"
              value={config.maxWalletUsagePercent}
              onChange={(e) =>
                setConfig({
                  ...config,
                  maxWalletUsagePercent:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              1 Coin Value
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={config.coinToCurrencyValue}
              onChange={(e) =>
                setConfig({
                  ...config,
                  coinToCurrencyValue:
                    e.target.value === "" ? "" : Number(e.target.value),
                })
              }
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Currency
            </label>
            <input
              type="text"
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-2">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium transition"
          >
            {saving ? "Saving..." : config._id ? "Update Config" : "Create Config"}
          </button>

          {config._id && (
            <button
              onClick={deleteConfig}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3.5 rounded-xl font-medium transition"
            >
              Delete Config
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================================
// PROMOTION PLANS TAB  (moved out of Promotionplan.tsx)
// ==========================================================
interface PromotionPlan {
  _id: string;
  name: string;
  description: string;
  days: number;
  price: number;
}

const PromotionPlansTab = () => {
  const [plans, setPlans] = useState<PromotionPlan[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await client.get("/promotion-plans");
      const sorted = res.data.plans.sort(
        (a: PromotionPlan, b: PromotionPlan) => a.days - b.days,
      );
      setPlans(sorted);
    } catch (err) {
      toast.error("Failed to fetch promotion plans ❌");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const resetForm = () => {
    setName("");
    setDescription("");
    setDays("");
    setPrice("");
    setEditingId(null);
  };

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
      setSaving(true);

      if (editingId) {
        await client.put(`/promotion-plan/${editingId}`, {
          name,
          description,
          days,
          price,
        });
        toast.success("Promotion plan updated ✅");
      } else {
        await client.post("/create-promotion-plan", {
          name,
          description,
          days,
          price,
        });
        toast.success("Promotion plan added 🎉");
      }

      resetForm();
      fetchPlans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save promotion plan ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (plan: PromotionPlan) => {
    setEditingId(plan._id);
    setName(plan.name);
    setDescription(plan.description || "");
    setDays(plan.days);
    setPrice(plan.price);
  };

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
      await client.delete(`/promotion-plan/${id}`);
      toast.success("Promotion plan deleted 🗑️");
      fetchPlans();
    } catch (err) {
      toast.error("Failed to delete plan ❌");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6">
      {/* FORM CARD */}
      <div className="bg-white shadow-sm rounded-2xl p-8 space-y-4 border border-slate-200 h-fit">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Megaphone className="h-5 w-5 text-amber-600" />
          {editingId ? "Edit Plan" : "Add New Plan"}
        </h3>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-600">
            Plan Name
          </label>
          <input
            type="text"
            placeholder="e.g. Featured 7 days"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-600">
            Description
          </label>
          <textarea
            placeholder="Plan description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Days
            </label>
            <input
              type="number"
              placeholder="Days"
              value={days}
              onChange={(e) => setDays(e.target.value ? Number(e.target.value) : "")}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-600">
              Price (EUR)
            </label>
            <input
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")}
              className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium transition"
          >
            {saving ? "Saving..." : editingId ? "Update Plan" : "Create Plan"}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-3.5 rounded-xl font-medium transition"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* LIST CARD */}
      <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Existing Plans
        </h3>

        {plans.length === 0 ? (
          <p className="text-slate-500 text-sm">No plans available</p>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-start gap-3"
              >
                <div>
                  <p className="font-semibold text-slate-800">{plan.name}</p>
                  {plan.description && (
                    <p className="text-slate-500 text-sm mt-1">{plan.description}</p>
                  )}
                  <p className="text-slate-600 text-sm mt-1">
                    {plan.days} Days — € {plan.price}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="p-2 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan._id)}
                    className="p-2 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================================
// SETTINGS PAGE — single home for all global config
// ==========================================================
const SettingsPage = () => {
  return (
    <div className="max-w-6xl mx-auto p-8 space-y-2">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <Settings className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">
            Platform-wide configuration — commission, cancellation, wallet and promotion rules.
          </p>
        </div>
      </div>

      <Tabs defaultValue="commission" className="pt-4">
        <TabsList className="h-11">
          <TabsTrigger value="commission" className="px-5">
            Commission &amp; Cancellation
          </TabsTrigger>
          <TabsTrigger value="wallet" className="px-5">
            Wallet &amp; Referral
          </TabsTrigger>
          <TabsTrigger value="promotion" className="px-5">
            Promotion Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="commission">
          <CommissionCancellationTab />
        </TabsContent>

        <TabsContent value="wallet">
          <WalletConfigTab />
        </TabsContent>

        <TabsContent value="promotion">
          <PromotionPlansTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
