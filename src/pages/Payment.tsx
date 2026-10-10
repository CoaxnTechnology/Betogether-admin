import React, { useEffect, useState } from "react";
import client from "../api/client";
import { CreditCard, Eye, Briefcase, ClipboardList } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PaymentRow {
  paymentId: string;
  bookingId: string | null;
  contactPhone: string | null;
  customer: { id: string | null; name: string | null; email: string | null; phone: string | null };
  provider: { id: string | null; name: string | null; email: string | null; phone: string | null };
  service: { id: string; title: string; price: number; isFree: boolean } | null;
  serviceRequest: {
    id: string;
    title: string;
    requestMode: string;
    budget?: { currency?: string; amount?: number };
  } | null;
  amount: number;
  currency: string;
  originalAmount: number;
  appCommission: number;
  providerAmount: number;
  providerCommissionPercentage: number;
  customerCommissionPercentage: number;
  totalPaidByCustomer: number;
  customerPaidAmount: number;
  usedWallet: boolean;
  walletCoinsUsed: number;
  walletAmountUsed: number;
  paymentStatus: string;
  captureStatus: string | null;
  capturedAt: string | null;
  failureReason: string | null;
  checkoutSessionId: string | null;
  paymentIntentId: string | null;
  customerStripeId: string | null;
  providerStripeId: string | null;
  transferId: string | null;
  transferStatus: string | null;
  transferAmount: number;
  transferCreatedAt: string | null;
  transferFailureReason: string | null;
  transferFailureCode: string | null;
  refundId: string | null;
  refundReason: string | null;
  refundStatus: string | null;
  refundedAmount: number;
  refundedAt: string | null;
  cancellationFee: number;
  platformRetainedAmount: number;
  createdAt: string;
  completedAt: string | null;
}

const REQUEST_MODE_LABEL: Record<string, string> = {
  paid_fixed: "Fixed Price",
  paid_offer: "Offer-Based",
  free_single: "Free — Single",
  free_group: "Free — Group",
};

const statusColor = (status: string) =>
  status === "completed" || status === "paid"
    ? "text-green-600"
    : status === "refunded"
    ? "text-blue-600"
    : status === "failed" || status === "canceled"
    ? "text-red-600"
    : "text-amber-600";

const formatDateTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

// ==========================================================
// DETAILS MODAL — everything support/monitoring would need to
// cross-reference this payment in the Stripe dashboard or
// trace what happened to the money.
// ==========================================================
const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-4 py-1.5 border-b border-slate-100 last:border-0">
    <span className="text-slate-500 text-sm">{label}</span>
    <span className="text-slate-800 text-sm font-medium text-right break-all">
      {value ?? "-"}
    </span>
  </div>
);

const PaymentDetailsDialog = ({
  payment,
  onClose,
}: {
  payment: PaymentRow | null;
  onClose: () => void;
}) => (
  <Dialog open={!!payment} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Payment Details</DialogTitle>
      </DialogHeader>

      {payment && (
        <div className="space-y-6 pt-2">
          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Identifiers
            </h4>
            <DetailRow label="Payment ID" value={payment.paymentId} />
            <DetailRow label="Booking ID" value={payment.bookingId} />
            <DetailRow label="Checkout Session ID" value={payment.checkoutSessionId} />
            <DetailRow label="Payment Intent ID" value={payment.paymentIntentId} />
            <DetailRow label="Customer Stripe ID" value={payment.customerStripeId} />
            <DetailRow label="Provider Stripe ID" value={payment.providerStripeId} />
            <DetailRow label="Contact Phone" value={payment.contactPhone} />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Amounts
            </h4>
            <DetailRow label="Amount" value={`${payment.amount} ${payment.currency}`} />
            <DetailRow label="Original Amount" value={payment.originalAmount} />
            <DetailRow label="App Commission" value={payment.appCommission} />
            <DetailRow
              label="Provider Commission %"
              value={payment.providerCommissionPercentage}
            />
            <DetailRow
              label="Customer Commission %"
              value={payment.customerCommissionPercentage}
            />
            <DetailRow label="Provider Amount" value={payment.providerAmount} />
            <DetailRow label="Customer Paid Amount" value={payment.customerPaidAmount} />
            <DetailRow label="Total Paid By Customer" value={payment.totalPaidByCustomer} />
            <DetailRow
              label="Wallet Used"
              value={
                payment.usedWallet
                  ? `${payment.walletCoinsUsed} coins (${payment.walletAmountUsed})`
                  : "No"
              }
            />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Payment Status
            </h4>
            <DetailRow
              label="Status"
              value={<span className={statusColor(payment.paymentStatus)}>{payment.paymentStatus}</span>}
            />
            <DetailRow label="Capture Status" value={payment.captureStatus} />
            <DetailRow label="Captured At" value={formatDateTime(payment.capturedAt)} />
            <DetailRow label="Failure Reason" value={payment.failureReason} />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Provider Transfer (Payout)
            </h4>
            <DetailRow label="Transfer ID" value={payment.transferId} />
            <DetailRow label="Transfer Status" value={payment.transferStatus} />
            <DetailRow label="Transfer Amount" value={payment.transferAmount} />
            <DetailRow label="Transfer Time" value={formatDateTime(payment.transferCreatedAt)} />
            <DetailRow label="Transfer Failure Reason" value={payment.transferFailureReason} />
            <DetailRow label="Transfer Failure Code" value={payment.transferFailureCode} />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Refund / Cancellation
            </h4>
            <DetailRow label="Refund ID" value={payment.refundId} />
            <DetailRow label="Refund Status" value={payment.refundStatus} />
            <DetailRow label="Refund Reason" value={payment.refundReason} />
            <DetailRow label="Refunded Amount" value={payment.refundedAmount} />
            <DetailRow label="Refunded At" value={formatDateTime(payment.refundedAt)} />
            <DetailRow label="Cancellation Fee" value={payment.cancellationFee} />
            <DetailRow label="Platform Retained Amount" value={payment.platformRetainedAmount} />
          </section>

          <section>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
              Timeline
            </h4>
            <DetailRow label="Created At" value={formatDateTime(payment.createdAt)} />
            <DetailRow label="Completed At" value={formatDateTime(payment.completedAt)} />
          </section>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

// ==========================================================
// SHARED TABLE — used by both the Service and Request tabs,
// only the `type` query param + a couple of display bits differ.
// ==========================================================
const PaymentsTable = ({ type }: { type: "service" | "request" }) => {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<PaymentRow | null>(null);

  const fetchPayments = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await client.get(
        `/payment?type=${type}&page=${pageNumber}&limit=${limit}`,
      );
      setPayments(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(res.data.currentPage || 1);
    } catch (error) {
      toast.error("Failed to load payments ❌");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  return (
    <div className="bg-white shadow-sm rounded-2xl p-8 border border-slate-200 mt-6">
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : payments.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No payments found.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-800 border-b border-blue-200">
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Provider</th>
                  <th className="p-3 text-left">{type === "request" ? "Request" : "Service"}</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">App Commission</th>
                  <th className="p-3 text-left">Provider Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Transaction Time</th>
                  <th className="p-3 text-left">Stripe Payment ID</th>
                  <th className="p-3 text-center">Details</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((pay) => (
                  <tr
                    key={pay.paymentId}
                    className="border-b border-slate-100 hover:bg-blue-50/50 transition"
                  >
                    <td className="p-3">{pay.customer?.name || "-"}</td>
                    <td className="p-3">{pay.provider?.name || "-"}</td>
                    <td className="p-3">
                      {type === "request" ? (
                        <div>
                          <div>{pay.serviceRequest?.title || "-"}</div>
                          {pay.serviceRequest?.requestMode && (
                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-medium">
                              {REQUEST_MODE_LABEL[pay.serviceRequest.requestMode] ||
                                pay.serviceRequest.requestMode}
                            </span>
                          )}
                        </div>
                      ) : (
                        pay.service?.title || "-"
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {pay.amount} {pay.currency}
                    </td>
                    <td className="p-3">{pay.appCommission}</td>
                    <td className="p-3">{pay.providerAmount}</td>
                    <td className={`p-3 font-semibold ${statusColor(pay.paymentStatus)}`}>
                      {pay.paymentStatus}
                    </td>
                    <td className="p-3 whitespace-nowrap text-slate-600">
                      {formatDateTime(pay.createdAt)}
                    </td>
                    <td className="p-3 font-mono text-xs text-slate-500 max-w-[160px] truncate">
                      {pay.paymentIntentId || "-"}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setSelected(pay)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition inline-flex"
                        title="View full details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => fetchPayments(page - 1)}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg border
            ${
              page === 1
                ? "bg-gray-200 cursor-not-allowed border-gray-300"
                : "bg-white hover:bg-blue-100 border-blue-400"
            } text-blue-700 shadow`}
            >
              Prev
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchPayments(i + 1)}
                  className={`px-3 py-2 rounded-lg border text-sm shadow
                ${
                  page === i + 1
                    ? "bg-blue-600 text-white border-blue-700"
                    : "bg-white text-blue-700 hover:bg-blue-100 border-blue-400"
                }
              `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchPayments(page + 1)}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg border
            ${
              page === totalPages
                ? "bg-gray-200 cursor-not-allowed border-gray-300"
                : "bg-white hover:bg-blue-100 border-blue-400"
            } text-blue-700 shadow`}
            >
              Next
            </button>
          </div>
        </>
      )}

      <PaymentDetailsDialog payment={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

// ==========================================================
// PAGE — two tabs: Service payments vs Service-Request payments
// ==========================================================
const PaymentSettings = () => {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-2 animate-fadeIn">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
          <CreditCard className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500">
            All payments processed on the platform, split by source. Click{" "}
            <Eye className="h-3.5 w-3.5 inline -mt-0.5" /> on any row for full Stripe /
            transfer / refund details. Commission and cancellation settings have moved
            to Settings.
          </p>
        </div>
      </div>

      <Tabs defaultValue="service" className="pt-4">
        <TabsList className="h-11">
          <TabsTrigger value="service" className="px-5 gap-2">
            <Briefcase className="h-4 w-4" /> Service Payments
          </TabsTrigger>
          <TabsTrigger value="request" className="px-5 gap-2">
            <ClipboardList className="h-4 w-4" /> Request Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service">
          <PaymentsTable type="service" />
        </TabsContent>

        <TabsContent value="request">
          <PaymentsTable type="request" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSettings;
