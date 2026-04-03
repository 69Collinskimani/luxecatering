"use client";
import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceDocument } from "./InvoicePDF";

export default function InvoiceDownload({ bookingRef, email }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const fetchInvoice = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/invoices?ref=${bookingRef}&email=${email}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Not found");
      setData(json);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div className="rounded-2xl p-6 border border-gray-700" style={{ background: "#1a1a1a" }}>
      <h3 className="font-black text-white mb-1" style={{ fontFamily: "Georgia,serif" }}>🧾 Your Invoice</h3>
      <p className="text-xs text-gray-400 mb-4">Download your booking invoice as a PDF</p>

      {!data ? (
        <button onClick={fetchInvoice} disabled={loading}
          className="w-full py-3 rounded-full text-sm font-bold text-white disabled:opacity-50 transition"
          style={{ background: "#C84B31" }}>
          {loading ? "⏳ Loading..." : "Load Invoice"}
        </button>
      ) : (
        <PDFDownloadLink
          document={<InvoiceDocument invoice={data.invoice} booking={data.booking} />}
          fileName={`Invoice-${data.invoice?.invoice_number || bookingRef}.pdf`}
        >
          {({ loading: pdfLoading }) => (
            <button disabled={pdfLoading}
              className="w-full py-3 rounded-full text-sm font-bold text-white disabled:opacity-50 transition"
              style={{ background: "#2D6A4F" }}>
              {pdfLoading ? "⏳ Generating PDF..." : "⬇️ Download Invoice PDF"}
            </button>
          )}
        </PDFDownloadLink>
      )}

      {error && <p className="text-xs mt-2" style={{ color: "#E53E3E" }}>{error}</p>}

      {data && (
        <div className="mt-4 space-y-2 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Invoice #</span>
            <span className="text-white font-bold">{data.invoice?.invoice_number}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Due</span>
            <span className="font-bold" style={{ color: "#C84B31" }}>${data.invoice?.total_amount?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="font-bold capitalize" style={{ color: data.invoice?.status === "paid" ? "#2D6A4F" : "#C84B31" }}>
              {data.invoice?.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Due Date</span>
            <span className="text-white">{data.invoice?.due_date || "On Event Day"}</span>
          </div>
        </div>
      )}
    </div>
  );
}