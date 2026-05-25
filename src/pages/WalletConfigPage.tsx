import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../API/baseUrl";

interface WalletConfig {
  _id?: string;
  inviterBonus: number | "";
  invitedBonus: number | "";
  maxWalletUsagePercent: number | "";
  coinToCurrencyValue: number | "";
  currency: string;
}

export default function WalletConfigPage() {
  const [loading, setLoading] = useState(false);

  const [saving, setSaving] = useState(false);

  const [config, setConfig] = useState<WalletConfig>({
    inviterBonus: "",
    invitedBonus: "",
    maxWalletUsagePercent: "",
    coinToCurrencyValue: "",
    currency: "",
  });

  console.log("WalletConfigPage render", { loading, saving, config });

  // ==========================
  // FETCH CONFIG
  // ==========================

  const getWalletConfig = async () => {
    try {
      console.log("getWalletConfig:start");
      setLoading(true);

      const res = await api.get("/wallet-config");
      console.log("getWalletConfig:response", res.data);

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
        console.log("getWalletConfig:setConfig", res.data.data);
      }
    } catch (err) {
      console.log("getWalletConfig:error", err);
    } finally {
      setLoading(false);
      console.log("getWalletConfig:finally");
    }
  };

  // ==========================
  // VALIDATION
  // ==========================

  const validateConfig = () => {
    const numericFields = [
      {
        key: "inviterBonus",
        label: "Inviter Bonus",
      },
      {
        key: "invitedBonus",
        label: "Invited Bonus",
      },
      {
        key: "maxWalletUsagePercent",
        label: "Max Wallet Usage %",
      },
      {
        key: "coinToCurrencyValue",
        label: "1 Coin Value",
      },
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

    return {
      isValid: invalidFields.length === 0,
      invalidFields,
    };
  };
  // ==========================
  // SAVE / UPDATE
  // ==========================

  const saveConfig = async () => {
    try {
      console.log("saveConfig:start", config);

      const { isValid, invalidFields } = validateConfig();

      if (!isValid) {
        toast.error(invalidFields.join(", "), {
          position: "top-right",
        });

        return;
      }

      setSaving(true);

      if (config._id) {
        console.log("saveConfig:update", config._id, config);

        await api.put(`/wallet-config/${config._id}`, config);

        console.log("saveConfig:updateSuccess");

        toast.success("Wallet config updated successfully", {
          position: "top-right",
        });
      } else {
        console.log("saveConfig:create", config);

        const res = await api.post("/wallet-config", config);

        console.log("saveConfig:createResponse", res.data);

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
        console.log("saveConfig:setConfig", res.data.data);

        toast.success("Wallet config created successfully", {
          position: "top-right",
        });
      }
    } catch (err: any) {
      console.log("saveConfig:error", err);

      toast.error(err?.response?.data?.message || "Something went wrong", {
        position: "top-right",
      });
    } finally {
      setSaving(false);

      console.log("saveConfig:finally");
    }
  };

  // ==========================
  // DELETE
  // ==========================

  const deleteConfig = async () => {
    try {
      console.log("deleteConfig:start", config);

      if (!config._id) {
        console.log("deleteConfig:aborted-no-id");
        return;
      }

      const { isValid, invalidFields } = validateConfig();

      if (!isValid) {
        toast.error(invalidFields.join(", "), {
          position: "top-right",
        });

        return;
      }

      await api.delete(`/wallet-config/${config._id}`);

      console.log("deleteConfig:deleted", config._id);

      setConfig({
        inviterBonus: "",
        invitedBonus: "",
        maxWalletUsagePercent: "",
        coinToCurrencyValue: "",
        currency: "",
      });

      console.log("deleteConfig:setConfig:reset");

      toast.success("Deleted successfully", {
        position: "top-right",
      });
    } catch (err: any) {
      console.log("deleteConfig:error", err);

      toast.error(err?.response?.data?.message || "Delete failed", {
        position: "top-right",
      });
    }
  };
  useEffect(() => {
    console.log("WalletConfigPage useEffect:mount");
    getWalletConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-semibold">
        Loading wallet config...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-5 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Wallet Config</h1>

          <p className="text-slate-500 mt-1">
            Manage referral bonuses, wallet limits and coin settings
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inviter Bonus */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Inviter Bonus
              </label>

              <input
                type="number"
                value={config.inviterBonus}
                onChange={(e) => {
                  console.log("input:inviterBonus", e.target.value);

                  setConfig({
                    ...config,

                    inviterBonus:
                      e.target.value === "" ? "" : Number(e.target.value),
                  });
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Invited Bonus */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Invited Bonus
              </label>

              <input
                type="number"
                value={config.invitedBonus}
                onChange={(e) => {
                  console.log("input:invitedBonus", e.target.value);

                  setConfig({
                    ...config,

                    invitedBonus:
                      e.target.value === "" ? "" : Number(e.target.value),
                  });
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Wallet Usage */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                Max Wallet Usage %
              </label>

              <input
                type="number"
                value={config.maxWalletUsagePercent}
                onChange={(e) => {
                  console.log("input:maxWalletUsagePercent", e.target.value);

                  setConfig({
                    ...config,

                    maxWalletUsagePercent:
                      e.target.value === "" ? "" : Number(e.target.value),
                  });
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Coin Value */}
            <div>
              <label className="block mb-2 font-semibold text-slate-700">
                1 Coin Value
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                value={config.coinToCurrencyValue}
                onChange={(e) => {
                  console.log("input:coinToCurrencyValue", e.target.value);

                  setConfig({
                    ...config,

                    coinToCurrencyValue:
                      e.target.value === "" ? "" : Number(e.target.value),
                  });
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Currency */}
            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold text-slate-700">
                Currency
              </label>

              <input
                type="text"
                value={config.currency}
                onChange={(e) => {
                  console.log("input:currency", e.target.value);
                  setConfig({
                    ...config,
                    currency: e.target.value,
                  });
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-semibold transition"
            >
              {saving
                ? "Saving..."
                : config._id
                ? "Update Config"
                : "Create Config"}
            </button>

            {config._id && (
              <button
                onClick={deleteConfig}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-semibold transition"
              >
                Delete Config
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
