import { useEffect, useMemo, useState } from "react";
import {
  getAllApplications,
  approveApplication,
  rejectApplication,
  getAllAmbassadors,
} from "../api/ambassador.api";
import { getTerritories } from "../api/territory.api";
import Select from "react-select";
import { toast } from "../components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

interface Application {
  _id: string;

  applicationType: "self";
  status: string;
  created_at: string;

  name?: string;
  email?: string;
  phoneNumber?: string;
  city?: string;

  profession?: string;
  targetAudience?: string;
  whyBecomeAmbassador?: string;
  howPromoteBetogether?: string;
  socialMediaUrls?: string[];

  acceptedAgreement?: boolean;
  reviewedAt?: string;
  rejectionReason?: string;

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
  exclusiveAmbassador?: {
    name: string;
  } | null;
}

interface Ambassador {
  _id: string;
  name: string;
  ambassadorType: string;
}

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const MIN_COMMISSION = 0;
const MAX_COMMISSION = 12;

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

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : "-";

// The application's own contact details first (what they typed in the
// form), the user profile as a fallback.
const applicantName = (a: Application) => a.user?.name || a.name || "-";
const applicantEmail = (a: Application) => a.user?.email || a.email || "-";
const applicantPhone = (a: Application) => a.user?.mobile || a.phoneNumber || "-";
const applicantCity = (a: Application) => a.city || a.user?.city || "-";

// Applicants often type links without a scheme ("www.instagram.com/x").
// As an href that is a relative path, so the browser opened it on the admin
// site itself. Add https:// when missing; anything that isn't http(s)
// (e.g. "javascript:") is not turned into a link at all.
const toExternalUrl = (raw: string): string | null => {
  const value = raw?.trim();
  if (!value) return null;
  const withScheme = /^[a-z][a-z\d+.-]*:/i.test(value)
    ? value
    : `https://${value.replace(/^\/+/, "")}`;
  try {
    const url = new URL(withScheme);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
};

const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClass(
      status,
    )}`}
  >
    {status || "unknown"}
  </span>
);

const Avatar = ({ src, size = "h-12 w-12" }: { src?: string; size?: string }) => (
  <img
    src={src || "/default-avatar.png"}
    alt=""
    className={`${size} shrink-0 rounded-full border object-cover`}
  />
);

const Field = ({ label, value }: { label: string; value?: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-medium uppercase text-gray-500">{label}</p>
    <p className="mt-1 break-words font-medium text-gray-800">{value || "-"}</p>
  </div>
);

const AmbassadorApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  // View
  const [detailsApplication, setDetailsApplication] = useState<Application | null>(null);

  // Approve
  const [approveTarget, setApproveTarget] = useState<Application | null>(null);
  const [ambassadorType, setAmbassadorType] = useState<"standard" | "exclusive">("standard");
  const [commissionRate, setCommissionRate] = useState("3");
  const [territoryIds, setTerritoryIds] = useState<string[]>([]);
  const [parentAmbassadorId, setParentAmbassadorId] = useState("");
  const [approving, setApproving] = useState(false);

  // Reject
  const [rejectTarget, setRejectTarget] = useState<Application | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const territoryOptions = territories
    .filter((territory) => !territory.exclusiveAmbassador)
    .map((territory) => ({
      value: territory._id,
      label: `${territory.city} (${territory.country})`,
    }));
  const parentOptions = ambassadors.filter((a) => a.ambassadorType === "exclusive");

  const loadData = async () => {
    setLoading(true);
    try {
      const [applicationsRes, territoriesRes, ambassadorsRes] = await Promise.all([
        getAllApplications(),
        getTerritories(),
        getAllAmbassadors(),
      ]);

      setApplications(applicationsRes.data.applications || []);
      setTerritories(territoriesRes.data.territories || []);
      setAmbassadors(ambassadorsRes.data.ambassadors || []);
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Failed to load applications",
        description:
          error?.response?.data?.message || "Something went wrong while fetching data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { all: applications.length, pending: 0, approved: 0, rejected: 0 };
    applications.forEach((a) => {
      const key = a.status?.toLowerCase() as StatusFilter;
      if (key in result && key !== "all") result[key] += 1;
    });
    return result;
  }, [applications]);

  const visibleApplications = useMemo(() => {
    const term = search.trim().toLowerCase();
    return applications.filter((a) => {
      if (statusFilter !== "all" && a.status?.toLowerCase() !== statusFilter) return false;
      if (!term) return true;
      return [applicantName(a), applicantEmail(a), applicantPhone(a), applicantCity(a), a.profession]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [applications, statusFilter, search]);

  // ---------- Approve ----------
  // Opened from the details dialog too — that one closes so only one
  // dialog is on screen (matters on small phones).
  const openApprove = (application: Application) => {
    setDetailsApplication(null);
    setApproveTarget(application);
    setAmbassadorType("standard");
    setCommissionRate("3");
    setTerritoryIds([]);
    setParentAmbassadorId("");
  };

  const commissionNumber = Number(commissionRate);
  const approveError = (() => {
    if (commissionRate === "" || Number.isNaN(commissionNumber)) return "Enter a commission rate.";
    if (commissionNumber < MIN_COMMISSION || commissionNumber > MAX_COMMISSION) {
      return `Commission rate must be between ${MIN_COMMISSION} and ${MAX_COMMISSION}%.`;
    }
    if (ambassadorType === "standard" && !parentAmbassadorId) {
      return "Select a parent ambassador.";
    }
    if (ambassadorType === "exclusive" && territoryIds.length === 0) {
      return "Select at least one territory.";
    }
    return null;
  })();

  const handleApprove = async () => {
    if (!approveTarget || approveError) return;
    setApproving(true);
    try {
      await approveApplication(approveTarget._id, {
        ambassadorType,
        commissionRate: commissionNumber,
        territoryIds: ambassadorType === "exclusive" ? territoryIds : undefined,
        parentAmbassadorId: ambassadorType === "standard" ? parentAmbassadorId : undefined,
      });

      setApproveTarget(null);
      setDetailsApplication(null);
      toast({
        title: "Application approved",
        description: "Ambassador approved successfully.",
      });
      loadData();
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Approval failed",
        description: error?.response?.data?.message || "Unable to approve the application.",
        variant: "destructive",
      });
    } finally {
      setApproving(false);
    }
  };

  // ---------- Reject ----------
  const openReject = (application: Application) => {
    setDetailsApplication(null);
    setRejectTarget(application);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (!rejectTarget || !rejectReason.trim()) return;
    setRejecting(true);
    try {
      await rejectApplication(rejectTarget._id, rejectReason.trim());

      setRejectTarget(null);
      setDetailsApplication(null);
      toast({
        title: "Application rejected",
        description: "The application was rejected successfully.",
      });
      loadData();
    } catch (error: any) {
      console.log(error);
      toast({
        title: "Rejection failed",
        description: error?.response?.data?.message || "Unable to reject the application.",
        variant: "destructive",
      });
    } finally {
      setRejecting(false);
    }
  };

  // ---------- Shared action buttons (table, card, details) ----------
  const ActionButtons = ({
    application,
    showView = true,
    full = false,
  }: {
    application: Application;
    showView?: boolean;
    full?: boolean;
  }) => {
    const isPending = application.status === "pending";
    const base = "rounded-lg px-3 py-2 text-sm font-medium text-white transition";
    return (
      <div
        className={
          full
            ? `grid gap-2 ${isPending ? (showView ? "grid-cols-3" : "grid-cols-2") : "grid-cols-1"}`
            : "flex flex-wrap gap-2"
        }
      >
        {showView && (
          <button
            onClick={() => setDetailsApplication(application)}
            className={`${base} bg-blue-600 hover:bg-blue-700`}
          >
            View
          </button>
        )}
        {isPending && (
          <>
            <button
              onClick={() => openApprove(application)}
              className={`${base} bg-green-600 hover:bg-green-700`}
            >
              Approve
            </button>
            <button
              onClick={() => openReject(application)}
              className={`${base} bg-red-600 hover:bg-red-700`}
            >
              Reject
            </button>
          </>
        )}
      </div>
    );
  };

  const emptyState = (
    <div className="px-4 py-10 text-center">
      <div className="font-medium text-gray-700">
        {loading ? "Loading applications..." : "No applications found"}
      </div>
      {!loading && (
        <div className="mt-1 text-sm text-gray-500">
          {applications.length
            ? "Try a different filter or search."
            : "New ambassador applications will appear here."}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl">
            Ambassador Applications
          </h1>
          <p className="mt-1 text-sm text-gray-500">Review and manage ambassador requests.</p>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter.label}
                <span className="ml-1.5 opacity-80">({counts[filter.value]})</span>
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, city..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 lg:w-80"
          />
        </div>

        <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
          {/* Desktop table (lg and up) */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 text-left text-gray-700">
                <tr>
                  <th className="border-b px-4 py-3 font-semibold">Applicant</th>
                  <th className="border-b px-4 py-3 font-semibold">Contact</th>
                  <th className="border-b px-4 py-3 font-semibold">Profession</th>
                  <th className="border-b px-4 py-3 font-semibold">City</th>
                  <th className="border-b px-4 py-3 font-semibold">Applied On</th>
                  <th className="border-b px-4 py-3 font-semibold">Status</th>
                  <th className="border-b px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visibleApplications.length > 0 ? (
                  visibleApplications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={application.user?.profile_image} />
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {applicantName(application)}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {application.user?._id?.slice(-6) || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="max-w-[220px] truncate font-medium text-gray-800">
                          {applicantEmail(application)}
                        </p>
                        <p className="text-sm text-gray-500">{applicantPhone(application)}</p>
                      </td>

                      <td className="px-4 py-4">
                        <span className="block max-w-[200px] truncate">
                          {application.profession || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 font-medium">{applicantCity(application)}</td>

                      <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                        {formatDate(application.created_at)}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={application.status} />
                      </td>

                      <td className="px-4 py-4">
                        <ActionButtons application={application} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>{emptyState}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile + tablet) */}
          <div className="grid gap-3 p-3 sm:grid-cols-2 lg:hidden">
            {visibleApplications.length > 0 ? (
              visibleApplications.map((application) => (
                <div
                  key={application._id}
                  className="flex min-w-0 flex-col rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={application.user?.profile_image} size="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold text-gray-900">
                        {applicantName(application)}
                      </h2>
                      <p className="truncate text-sm text-gray-600">
                        {applicantEmail(application)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <Field label="Phone" value={applicantPhone(application)} />
                    <Field label="City" value={applicantCity(application)} />
                    <Field label="Profession" value={application.profession} />
                    <Field label="Applied On" value={formatDate(application.created_at)} />
                  </div>

                  <div className="mt-4 border-t pt-4 sm:mt-auto">
                    <ActionButtons application={application} full />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed sm:col-span-2">{emptyState}</div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- View details ---------- */}
      <Dialog
        open={!!detailsApplication}
        onOpenChange={(open) => !open && setDetailsApplication(null)}
      >
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-3xl flex-col gap-0 overflow-hidden rounded-lg p-0">
          {detailsApplication && (
            <>
              <DialogHeader className="border-b p-4 pr-12 text-left sm:p-6 sm:pr-12">
                <DialogTitle className="text-lg sm:text-xl">
                  Ambassador Application Review
                </DialogTitle>
                <DialogDescription>
                  Applied on {formatDate(detailsApplication.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Profile */}
                <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                  <Avatar
                    src={detailsApplication.user?.profile_image}
                    size="h-20 w-20 sm:h-24 sm:w-24"
                  />
                  <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Name" value={applicantName(detailsApplication)} />
                    <Field label="Email" value={applicantEmail(detailsApplication)} />
                    <Field label="Mobile" value={applicantPhone(detailsApplication)} />
                    <Field label="City" value={applicantCity(detailsApplication)} />
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <StatusBadge status={detailsApplication.status} />
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Self Application
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      detailsApplication.acceptedAgreement
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {detailsApplication.acceptedAgreement
                      ? "Agreement accepted"
                      : "Agreement not accepted"}
                  </span>
                </div>

                {detailsApplication.status === "rejected" && detailsApplication.rejectionReason && (
                  <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
                    <p className="font-semibold text-red-800">Rejection reason</p>
                    <p className="mt-1 break-words text-red-700">
                      {detailsApplication.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    { label: "Services", value: detailsApplication.user?.totalServices },
                    { label: "Bookings", value: detailsApplication.user?.totalBookings },
                    { label: "Successful", value: detailsApplication.user?.successfulBookings },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border p-3 text-center sm:p-5 sm:text-left">
                      <p className="text-xs text-gray-500 sm:text-sm">{stat.label}</p>
                      <p className="mt-1 text-xl font-bold sm:text-3xl">{stat.value || 0}</p>
                    </div>
                  ))}
                </div>

                {/* Answers */}
                <div className="space-y-4">
                  {[
                    { label: "Profession", value: detailsApplication.profession },
                    { label: "Target Audience", value: detailsApplication.targetAudience },
                    { label: "Why Become Ambassador?", value: detailsApplication.whyBecomeAmbassador },
                    { label: "How Will Promote BeTogether?", value: detailsApplication.howPromoteBetogether },
                  ].map((item) => (
                    <div key={item.label}>
                      <h3 className="mb-1.5 text-sm font-semibold text-gray-900">{item.label}</h3>
                      <div className="whitespace-pre-wrap break-words rounded-lg bg-gray-50 p-3 text-sm text-gray-700 sm:p-4">
                        {item.value || "-"}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  <h3 className="mb-2 text-sm font-semibold text-gray-900">Social Media Links</h3>
                  <div className="flex flex-wrap gap-2">
                    {detailsApplication.socialMediaUrls?.length ? (
                      detailsApplication.socialMediaUrls.map((url, index) => {
                        const href = toExternalUrl(url);
                        return href ? (
                          <a
                            key={index}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-blue-100 px-3 py-2 text-sm text-blue-700 hover:bg-blue-200"
                          >
                            Link {index + 1}
                          </a>
                        ) : (
                          <span
                            key={index}
                            title="Not a valid link"
                            className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500"
                          >
                            Link {index + 1}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-sm text-gray-500">No links</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:p-6">
                <button
                  onClick={() => setDetailsApplication(null)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {detailsApplication.status === "pending" && (
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <button
                      onClick={() => openReject(detailsApplication)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openApprove(detailsApplication)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ---------- Approve ---------- */}
      <Dialog open={!!approveTarget} onOpenChange={(open) => !open && !approving && setApproveTarget(null)}>
        <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-lg p-0">
          <DialogHeader className="border-b p-4 pr-12 text-left sm:p-6 sm:pr-12">
            <DialogTitle className="text-lg sm:text-xl">Approve Ambassador</DialogTitle>
            {approveTarget && (
              <DialogDescription className="truncate">
                {applicantName(approveTarget)} · {applicantEmail(approveTarget)}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Ambassador Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["standard", "exclusive"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setAmbassadorType(type)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition ${
                      ambassadorType === type
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                {ambassadorType === "exclusive"
                  ? "Owns one or more territories."
                  : "Works under an exclusive (parent) ambassador."}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Commission Rate (%)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min={MIN_COMMISSION}
                max={MAX_COMMISSION}
                step="0.1"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Between {MIN_COMMISSION} and {MAX_COMMISSION}%.
              </p>
            </div>

            {ambassadorType === "exclusive" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Territories</label>
                <Select
                  isMulti
                  options={territoryOptions}
                  placeholder="Search and select territories..."
                  noOptionsMessage={() => "No free territories"}
                  value={territoryOptions.filter((option) => territoryIds.includes(option.value))}
                  onChange={(selected) =>
                    setTerritoryIds(selected ? selected.map((option) => option.value) : [])
                  }
                  classNamePrefix="territory-select"
                  styles={{
                    control: (base) => ({ ...base, minHeight: 42, borderRadius: 8 }),
                    menu: (base) => ({ ...base, zIndex: 60 }),
                  }}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Only territories without an exclusive ambassador are listed.
                </p>
              </div>
            )}

            {ambassadorType === "standard" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Parent Ambassador</label>
                <select
                  value={parentAmbassadorId}
                  onChange={(e) => setParentAmbassadorId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select parent</option>
                  {parentOptions.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {parentOptions.length === 0 && (
                  <p className="mt-1.5 text-xs text-red-600">
                    No exclusive ambassadors yet — approve an exclusive one first.
                  </p>
                )}
              </div>
            )}

            {approveError && <p className="text-sm text-red-600">{approveError}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2 border-t p-4 sm:flex sm:justify-end sm:p-6">
            <button
              onClick={() => setApproveTarget(null)}
              disabled={approving}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={approving || !!approveError}
              className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {approving ? "Approving..." : "Approve"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Reject ---------- */}
      <Dialog open={!!rejectTarget} onOpenChange={(open) => !open && !rejecting && setRejectTarget(null)}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-md gap-0 rounded-lg p-0">
          <DialogHeader className="border-b p-4 pr-12 text-left sm:p-6 sm:pr-12">
            <DialogTitle className="text-lg sm:text-xl">Reject Application</DialogTitle>
            {rejectTarget && (
              <DialogDescription className="truncate">{applicantName(rejectTarget)}</DialogDescription>
            )}
          </DialogHeader>

          <div className="p-4 sm:p-6">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Tell the applicant why the application was rejected..."
              className="w-full resize-none rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 border-t p-4 sm:flex sm:justify-end sm:p-6">
            <button
              onClick={() => setRejectTarget(null)}
              disabled={rejecting}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={rejecting || !rejectReason.trim()}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {rejecting ? "Rejecting..." : "Reject"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmbassadorApplications;
