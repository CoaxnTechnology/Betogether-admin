import { useEffect, useState } from "react";
import {
  getAllApplications,
  approveApplication,
  rejectApplication,
  getAllAmbassadors,
} from "../API/ambassadorApi";
import { getTerritories } from "../API/territoryApi";
import Select from "react-select";
import { toast } from "../components/ui/use-toast";
interface Application {
  _id: string;

  applicationType: "self";
  status: string;
  created_at: string;

  city?: string;

  profession?: string;
  targetAudience?: string;
  whyBecomeAmbassador?: string;
  howPromoteBetogether?: string;
  socialMediaUrls?: string[];

  acceptedAgreement?: boolean;

  user?: {
    _id: string;
    name: string;
    email: string;
    mobile?: string;
    city?: string;
    country?: string;
    profile_image?: string;

    totalBookings?: number;
    successfulBookings?: number;
    totalServices?: number;
  };
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

const AmbassadorApplications = () => {
  const token = localStorage.getItem("adminToken") || "";

  const [applications, setApplications] = useState<Application[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDetails, setSelectedDetails] =
    useState<Application | null>(null);
  const [ambassadorType, setAmbassadorType] = useState<
    "standard" | "exclusive"
  >("standard");

  const [commissionRate, setCommissionRate] = useState(3);

  const [territoryIds, setTerritoryIds] = useState<string[]>([]);
  const territoryOptions = territories.map((territory) => ({
    value: territory._id,
    label: `${territory.city} (${territory.country})`,
  }));
  const [parentAmbassadorId, setParentAmbassadorId] = useState("");

  const getApplicantName = (application: Application) =>
    application.user?.name || "-";
  const getApplicantEmail = (application: Application) =>
    application.user?.email || "-";

  const getStatusClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const loadData = async () => {
    try {
      const [applicationsRes, territoriesRes, ambassadorsRes] =
        await Promise.all([
          getAllApplications(token),

          getTerritories(token),
          getAllAmbassadors(token),
        ]);

      console.log("getAllApplications response:", applicationsRes);
      setApplications(applicationsRes.data.applications || []);

      setTerritories(territoriesRes.data.territories || []);
      setAmbassadors(ambassadorsRes.data.ambassadors || []);
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Failed to load applications",
        description: error?.response?.data?.message ||"Something went wrong while fetching data.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openApproveModal = (application: Application) => {
    setSelectedApplication(application);

    setAmbassadorType("standard");
    setCommissionRate(3);
    setTerritoryIds([]);
    setParentAmbassadorId("");

    setShowApproveModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;

    try {
      await approveApplication(
        selectedApplication._id,
        {
          ambassadorType,
          commissionRate,

          territoryIds:
            ambassadorType === "exclusive"
              ? territoryIds
              : undefined,

          parentAmbassadorId:
            ambassadorType === "standard"
              ? parentAmbassadorId
              : undefined,
        },
        token,
      );

      setShowApproveModal(false);
      toast({
        title: "Application approved",
        description: "Ambassador approved successfully.",
      });

      loadData();
    } catch (error: any) {
  console.log(error);

  toast({
    title: "Approval failed",
    description:
      error?.response?.data?.message ||
      "Unable to approve the application.",
    variant: "destructive",
  });
}
  };

  const handleReject = async (applicationId: string) => {
    const reason = prompt("Enter rejection reason");

    if (!reason) return;

    try {
      await rejectApplication(applicationId, reason, token);

      toast({
        title: "Application rejected",
        description: "The application was rejected successfully.",
      });

      loadData();
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Rejection failed",
        description:
          error?.response?.data?.message ||
          "Unable to reject the application.",
        variant: "destructive",
      });
    }
  };
  const openDetailsModal = (application: Application) => {
    setSelectedDetails(application);
    setShowDetailsModal(true);
  };
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Ambassador Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage ambassador requests.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="border-b px-4 py-3 font-semibold">
                    Applicant
                  </th>

                  <th className="border-b px-4 py-3 font-semibold">Contact</th>

                  <th className="border-b px-4 py-3 font-semibold">
                    Profession
                  </th>

                  <th>
                    City
                  </th>
                  <th className="border-b px-4 py-3 font-semibold">Type</th>
                  <th className="border-b px-4 py-3 font-semibold">
                    Applied On
                  </th>

                  <th className="border-b px-4 py-3 font-semibold">Status</th>

                  <th className="border-b px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {applications.length > 0 ? (
                  applications.map((application) => {
                    const applicant = application.user;

                    return (
                      <tr
                        key={application._id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >
                        {/* Applicant */}

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={applicant?.profile_image || "/default-avatar.png"}
                              alt=""
                              className="h-12 w-12 rounded-full border object-cover"
                            />

                            <div>
                              <p className="font-semibold text-gray-900">
                                {applicant?.name || "-"}
                              </p>

                              <p className="text-xs text-gray-500">
                                ID: {applicant?._id?.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}

                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-800">
                              {applicant?.email || "-"}
                            </p>

                            <p className="text-sm text-gray-500">
                              {applicant?.mobile || "-"}
                            </p>
                          </div>
                        </td>

                        {/* Profession */}

                        <td className="px-4 py-4">
                          <span className="block max-w-[220px] truncate">
                            {application.profession || "-"}
                          </span>
                        </td>

                        {/* City */}

                        <td className="px-4 py-4">
                          <p className="font-medium">
                            {application.city || "-"}
                          </p>
                        </td>

                        {/* Type */}

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                            Self Application
                          </span>
                        </td>

                        {/* Applied Date */}

                        <td className="px-4 py-4 text-sm text-gray-600">
                          {new Date(application.created_at).toLocaleDateString()}
                        </td>

                        {/* Status */}

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                              application.status,
                            )}`}
                          >
                            {application.status}
                          </span>
                        </td>

                        {/* Actions */}

                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openDetailsModal(application)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                              View
                            </button>

                            {application.status === "pending" && (
                              <>
                                <button
                                  onClick={() => openApproveModal(application)}
                                  className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                  Approve
                                </button>

                                <button
                                  onClick={() => handleReject(application._id)}
                                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center">
                      <div className="font-medium text-gray-700">
                        No applications found
                      </div>

                      <div className="mt-1 text-sm text-gray-500">
                        New ambassador applications will appear here.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-3 md:hidden">
            {applications.length > 0 ? (
              applications.map((application) => (
                <div
                  key={application._id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-gray-900">
                        {getApplicantName(application)}
                      </h2>
                      <p className="mt-1 truncate text-sm text-gray-600">
                        {getApplicantEmail(application)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
                        application.status,
                      )}`}
                    >
                      {application.status || "unknown"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-gray-500">
                        City
                      </p>
                      <p className="mt-1 font-medium text-gray-800">
                        {application.user?.city || "-"}
                      </p>
                    </div>

                    {application.user?.mobile && (
                      <div>
                        <p className="text-xs font-medium uppercase text-gray-500">
                          Phone
                        </p>
                        <p className="mt-1 font-medium text-gray-800">
                          {application.user?.mobile}
                        </p>
                      </div>
                    )}
                  </div>

                  {application.status === "pending" && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openApproveModal(application)}
                        className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReject(application._id)}
                        className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <div className="font-medium text-gray-700">
                  No applications found
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  New ambassador applications will appear here.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showDetailsModal &&
        selectedDetails &&
        (() => {
          const detailApplicant = selectedDetails.user;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="border-b p-6">
                  <h2 className="text-2xl font-bold">
                    Ambassador Application Review
                  </h2>
                </div>

                <div className="p-6">
                  {/* PROFILE */}

                  <div className="mb-6 flex flex-col gap-5 md:flex-row">
                    <img
                      src={
                        detailApplicant?.profile_image || "/default-avatar.png"
                      }
                      alt=""
                      className="h-28 w-28 rounded-full border object-cover"
                    />

                    <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-semibold">
                          {detailApplicant?.name || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold">
                          {detailApplicant?.email || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-semibold">
                          {detailApplicant?.mobile || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-semibold">
                          {detailApplicant?.city || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TYPE */}

                  <div className="mb-6">
                    <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold">
                      Self Ambassador Application
                    </span>
                  </div>

                  {/* STATS */}


                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-xl border p-5">
                      <p className="text-gray-500">Total Services</p>
                      <h3 className="text-3xl font-bold">
                        {detailApplicant?.totalServices || 0}
                      </h3>
                    </div>

                    <div className="rounded-xl border p-5">
                      <p className="text-gray-500">Total Bookings</p>
                      <h3 className="text-3xl font-bold">
                        {detailApplicant?.totalBookings || 0}
                      </h3>
                    </div>

                    <div className="rounded-xl border p-5">
                      <p className="text-gray-500">Successful Bookings</p>
                      <h3 className="text-3xl font-bold">
                        {detailApplicant?.successfulBookings || 0}
                      </h3>
                    </div>
                  </div>




                  {/* SELF APPLICATION */}

                  <>
                    <div className="space-y-5">
                      <div>
                        <h3 className="mb-2 font-semibold">Profession</h3>

                        <div className="rounded-lg bg-gray-50 p-4">
                          {selectedDetails.profession || "-"}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">
                          Target Audience
                        </h3>

                        <div className="rounded-lg bg-gray-50 p-4">
                          {selectedDetails.targetAudience || "-"}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">
                          Why Become Ambassador?
                        </h3>

                        <div className="rounded-lg bg-gray-50 p-4">
                          {selectedDetails.whyBecomeAmbassador || "-"}
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-2 font-semibold">
                          How Will Promote BeTogether?
                        </h3>

                        <div className="rounded-lg bg-gray-50 p-4">
                          {selectedDetails.howPromoteBetogether || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h3 className="mb-3 font-semibold">
                        Social Media Links
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {selectedDetails.socialMediaUrls?.length ? (
                          selectedDetails.socialMediaUrls.map(
                            (url: string, index: number) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded bg-blue-100 px-3 py-2 text-blue-700"
                              >
                                Link {index + 1}
                              </a>
                            ),
                          )
                        ) : (
                          <span>No Links</span>
                        )}
                      </div>
                    </div>
                  </>
                </div>

                <div className="flex justify-end border-t p-6">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="rounded border px-4 py-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Approve Ambassador
              </h2>
              {selectedApplication && (
                <p className="mt-1 truncate text-sm text-gray-500">
                  {getApplicantName(selectedApplication)}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Ambassador Type
                </label>

                <select
                  value={ambassadorType}
                  onChange={(e) =>
                    setAmbassadorType(e.target.value as "standard" | "exclusive")
                  }
                  className="w-full rounded-md border border-gray-300 p-2.5"
                >
                  <option value="standard">Standard</option>
                  <option value="exclusive">Exclusive</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Commission Rate
                </label>

                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {ambassadorType === "exclusive" && (
                <div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Territories
  </label>

  <Select
    isMulti
    options={territoryOptions}
    placeholder="Search and select territories..."
    value={territoryOptions.filter((option) =>
      territoryIds.includes(option.value)
    )}
    onChange={(selectedOptions) =>
      setTerritoryIds(
        selectedOptions
          ? selectedOptions.map((option) => option.value)
          : []
      )
    }
  />
</div>
              )}

              {ambassadorType === "standard" && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Parent Ambassador
                  </label>

                  <select
                    value={parentAmbassadorId}
                    onChange={(e) => setParentAmbassadorId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Parent</option>

                    {ambassadors
                      .filter((a) => a.ambassadorType === "exclusive")
                      .map((a) => (
                        <option key={a._id} value={a._id}>
                          {a.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="rounded border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:order-1"
              >
                Cancel
              </button>

              <button
                onClick={handleApprove}
                className="rounded bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 sm:order-2"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AmbassadorApplications;
