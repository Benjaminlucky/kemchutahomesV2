import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Shield,
  Star,
  CreditCard,
  FileText,
  Calendar,
  Home,
  AlertTriangle,
  Lock,
  Info,
} from "lucide-react";
import DownloadDocumentButton from "./DownloadDocumentButton";
import { fmtNGN, fmtDate } from "./portalFormat";
import { getClientMilestones } from "./subscriptionMilestones";
import type { SubscriptionDetail, DocumentType } from "./types";

const STATUS_HEADLINE: Record<string, string> = {
  pending: "Awaiting Confirmation",
  confirmed: "Confirmed — Make Your Payment",
  partial_paid: "Partial Payment Received",
  outright_paid: "Full Payment Received",
  inst_1_paid: "Deposit Received",
  inst_2_paid: "Instalment 2 Complete",
  inst_3_paid: "Instalment 3 Complete",
  inst_4_paid: "Instalment 4 Complete",
  inst_5_paid: "Instalment 5 Complete",
  inst_6_paid: "Instalment 6 Complete",
  completed: "All Payments Complete",
  allocated: "Plot Allocated",
  rejected: "Subscription Rejected",
};

const DOC_META: Record<string, { label: string; icon: typeof FileText }> = {
  acknowledgement: { label: "Subscription Acknowledgement", icon: FileText },
  invoice: { label: "Payment Invoice", icon: CreditCard },
  contract: { label: "Contract of Sale", icon: Shield },
  schedule: { label: "Instalment Schedule", icon: Calendar },
  receipt: { label: "Payment Receipt", icon: CheckCircle },
  allocation: { label: "Letter of Allocation", icon: Home },
  deed: { label: "Deed of Assignment", icon: Star },
};

export default function SubscriptionDetailView({ sub }: { sub: SubscriptionDetail }) {
  const milestones = getClientMilestones(sub);
  const pct = sub.totalAmount ? Math.min(100, Math.round(((sub.amountPaid || 0) / sub.totalAmount) * 100)) : 0;
  const balance = Math.max(0, sub.totalAmount - (sub.amountPaid || 0));
  const isInst = sub.paymentPlan === "Instalment";
  const nextInstalment = sub.instalmentSchedule?.find((s) => !s.isPaid);
  const headline = STATUS_HEADLINE[sub.status] || sub.status;
  const docs = sub.documents || [];

  return (
    <div className="space-y-6 pb-10">
      <Link
        href="/client/portal"
        className="inline-flex items-center gap-1.5 text-sm font-bold text-customPurple-600 hover:text-customPurple-700"
      >
        <ArrowLeft size={16} /> Back to portal
      </Link>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl px-7 py-7 text-white"
        style={{ background: "linear-gradient(135deg, #3F0C91, #700CEB)" }}
      >
        <div className="pointer-events-none absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative">
          <p className="mb-1 text-[10px] font-bold tracking-widest text-white/60 uppercase">Land Subscription</p>
          <h1 className="mb-1 text-xl font-black tracking-tight">{sub.estateName}</h1>
          <p className="mb-4 font-mono text-xs text-white/65">{sub.referenceNumber}</p>

          <div className="mb-5 flex flex-wrap gap-2">
            {[
              `${sub.plotType} · ${sub.plotSize}`,
              `×${sub.numberOfPlots} plot${sub.numberOfPlots > 1 ? "s" : ""}`,
              isInst ? `${sub.instalmentMonths}-month instalment` : "Outright",
            ].map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2.5">
            <Info size={14} className="shrink-0 text-white/70" />
            <p className="text-sm font-bold">{headline}</p>
          </div>
        </div>
      </div>

      {/* Payment summary */}
      <div className="rounded-3xl border border-customBlack-100 bg-white p-6 shadow-sm">
        <p className="mb-4 text-[11px] font-bold tracking-widest text-customBlack-400 uppercase">Payment Summary</p>

        <div className="mb-1.5 flex justify-between">
          <span className="text-xs font-bold text-customBlack-600">Progress</span>
          <span className="text-sm font-black text-customPurple-600">{pct}%</span>
        </div>
        <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-customPurple-50">
          <div
            className={`h-full rounded-full ${pct === 100 ? "bg-gradient-to-r from-green-600 to-green-400" : "bg-gradient-to-r from-[#3F0C91] to-customPurple-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {[
            { l: "Total", v: fmtNGN(sub.totalAmount), c: "text-customBlack-900" },
            { l: "Paid", v: fmtNGN(sub.amountPaid || 0), c: "text-green-600" },
            { l: "Balance", v: fmtNGN(balance), c: balance > 0 ? "text-red-600" : "text-green-600" },
          ].map(({ l, v, c }) => (
            <div key={l} className="rounded-xl bg-customPurple-50/60 px-2 py-3 text-center">
              <p className="mb-1 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">{l}</p>
              <p className={`text-sm font-black tracking-tight ${c}`}>{v}</p>
            </div>
          ))}
        </div>

        {nextInstalment && !["completed", "allocated"].includes(sub.status) && (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 ${
              new Date(nextInstalment.dueDate) < new Date()
                ? "border-red-200 bg-red-50"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p className={`mb-0.5 text-xs font-extrabold ${new Date(nextInstalment.dueDate) < new Date() ? "text-red-600" : "text-amber-600"}`}>
              {new Date(nextInstalment.dueDate) < new Date() ? "Payment Overdue" : "Next Payment Due"}
            </p>
            <p className="text-sm font-bold text-customBlack-900">
              {fmtNGN(nextInstalment.amount)} — {fmtDate(nextInstalment.dueDate)}
            </p>
          </div>
        )}
      </div>

      {/* Journey timeline */}
      <div className="rounded-3xl border border-customBlack-100 bg-white p-6 shadow-sm">
        <p className="mb-5 text-[11px] font-bold tracking-widest text-customBlack-400 uppercase">Your Journey</p>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[17px] w-0.5 bg-customPurple-50" />
          <div className="space-y-5">
            {milestones.map((m, i) => (
              <div key={i} className="relative flex gap-3.5">
                <div
                  className={`z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${
                    m.done
                      ? "border-green-600 bg-green-600"
                      : m.overdue
                        ? "border-red-600 bg-red-600"
                        : "border-customPurple-100 bg-customPurple-50"
                  }`}
                >
                  {m.done ? (
                    <CheckCircle size={15} className="text-white" />
                  ) : m.overdue ? (
                    <AlertTriangle size={14} className="text-white" />
                  ) : (
                    <Lock size={14} className="text-customPurple-300" />
                  )}
                </div>
                <div className="flex-1 pt-1.5">
                  <p className={`text-sm font-extrabold ${m.done ? "text-customBlack-900" : m.overdue ? "text-red-600" : "text-customBlack-400"}`}>
                    {m.label}
                    {m.isFinal && m.done && <span className="ml-1.5 text-xs text-green-600">✓ Complete</span>}
                  </p>
                  <p className={`mt-0.5 text-xs leading-relaxed ${m.overdue ? "text-red-500" : "text-customBlack-400"}`}>{m.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instalment schedule */}
      {isInst && sub.instalmentSchedule?.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-customBlack-100 bg-white shadow-sm">
          <div className="border-b border-customBlack-50 px-6 py-4">
            <p className="text-[11px] font-bold tracking-widest text-customBlack-400 uppercase">Payment Schedule</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-customBlack-50/50">
                  {["Instalment", "Due Date", "Amount", "Status"].map((h) => (
                    <th key={h} className="px-6 py-3 text-[10px] font-bold tracking-widest text-customBlack-400 uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-customBlack-50">
                {sub.instalmentSchedule.map((inst, i) => {
                  const overdue = !inst.isPaid && new Date(inst.dueDate) < new Date();
                  return (
                    <tr key={inst._id}>
                      <td className="px-6 py-3 text-xs font-semibold text-customBlack-700">
                        {i === 0 ? "Deposit" : `Instalment ${i + 1}`}
                      </td>
                      <td className={`px-6 py-3 text-xs ${overdue ? "font-bold text-red-600" : "text-customBlack-700"}`}>
                        {fmtDate(inst.dueDate)}
                      </td>
                      <td className="px-6 py-3 text-xs font-bold text-customBlack-900">{fmtNGN(inst.amount)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            inst.isPaid
                              ? "bg-green-100 text-green-700"
                              : overdue
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {inst.isPaid ? "Paid" : overdue ? "Overdue" : "Upcoming"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents */}
      {docs.length > 0 && (
        <div className="rounded-3xl border border-customBlack-100 bg-white p-6 shadow-sm">
          <p className="mb-4 text-[11px] font-bold tracking-widest text-customBlack-400 uppercase">
            Your Documents ({docs.length})
          </p>
          <div className="flex flex-col gap-2.5">
            {docs.map((doc) => {
              const meta = DOC_META[doc.type] || { label: doc.label, icon: FileText };
              const Icon = meta.icon;
              return (
                <div key={doc._id} className="flex items-center justify-between gap-3 rounded-2xl bg-customPurple-50/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-customPurple-100">
                      <Icon size={16} className="text-customPurple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-customBlack-900">{doc.label}</p>
                      <p className="text-[10px] text-customBlack-400">{fmtDate(doc.generatedAt)}</p>
                    </div>
                  </div>
                  <DownloadDocumentButton
                    subscriptionId={sub._id}
                    docType={doc.type as DocumentType}
                    label={doc.label}
                    referenceNumber={sub.referenceNumber}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment support note */}
      {!["completed", "allocated"].includes(sub.status) && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4">
          <p className="mb-1 text-xs font-extrabold text-green-700">Need payment details?</p>
          <p className="text-xs text-customBlack-600">
            Contact{" "}
            <a href="mailto:info@kemchutahomesltd.com" className="font-bold text-customPurple-600">
              info@kemchutahomesltd.com
            </a>{" "}
            with your reference{" "}
            <span className="font-mono font-bold text-customPurple-600">{sub.referenceNumber}</span> for our current
            payment account details.
          </p>
        </div>
      )}

      {sub.status === "pending" && (
        <div className="flex items-center gap-2 rounded-2xl border border-customBlack-100 bg-white px-5 py-4 text-xs text-customBlack-400">
          <Clock size={14} className="shrink-0" />
          Your application is under review. We&rsquo;ll be in touch within 24–48 hours.
        </div>
      )}
    </div>
  );
}
