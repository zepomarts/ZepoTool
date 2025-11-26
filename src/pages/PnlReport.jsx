// frontend/src/pages/PnlReport.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";


export default function PnlReport() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [totals, setTotals] = useState({});
  const [topByQty, setTopByQty] = useState([]);
  const [topByProfit, setTopByProfit] = useState([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/pnl`); // optionally add ?fileId=
        if (!active) return;
        if (res.data) {
          setMonths(res.data.months || []);
          setTotals(res.data.totals || {});
          setTopByQty(res.data.topByQty || []);
          setTopByProfit(res.data.topByProfit || []);
        }
      } catch (err) {
        console.error("P&L Fetch Error:", err);
        setMonths([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    return () => (active = false);
  }, []);

  const filtered = months.filter(m => {
    if (!from && !to) return true;
    const mm = moment(m.month, "YYYY-MM");
    if (from && mm.isBefore(moment(from, "YYYY-MM"), "month")) return false;
    if (to && mm.isAfter(moment(to, "YYYY-MM"), "month")) return false;
    return true;
  });

  if (loading) return <div className="p-10 text-center text-lg text-slate-600">Loading Profit & Loss Report…</div>;
  if (!months.length) return <div className="p-10 text-center text-lg text-red-600">No P&L data found.</div>;

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Profit & Loss — Advanced</h1>
        <p className="text-sm text-slate-500">Derived metrics from processed analysis results.</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <label className="text-sm text-slate-600">From Month</label>
          <input type="month" value={from} onChange={e => setFrom(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded bg-slate-50" />
        </div>
        <div className="col-span-4">
          <label className="text-sm text-slate-600">To Month</label>
          <input type="month" value={to} onChange={e => setTo(e.target.value)}
            className="mt-1 w-full px-3 py-2 border rounded bg-slate-50" />
        </div>
        <div className="col-span-4 flex items-end">
          <button onClick={() => { setFrom(""); setTo(""); }}
            className="px-4 py-2 bg-slate-700 text-white rounded">Reset</button>
          <div className="ml-3 text-sm text-slate-600">Total Months: {filtered.length}</div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-slate-500">Sales</div>
          <div className="text-lg font-semibold">₹ {Number(totals.sales || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-slate-500">Units Sold</div>
          <div className="text-lg font-semibold">{Number(totals.unitsSold || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-slate-500">Refund Cost</div>
          <div className="text-lg font-semibold text-rose-600">₹ {Number(totals.refundAmount || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-slate-500">COGS</div>
          <div className="text-lg font-semibold">₹ {Number(totals.cogs || 0).toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-xs text-slate-500">Net Profit</div>
          <div className={`text-lg font-semibold ${totals.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>₹ {Number(totals.netProfit || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-white p-4 rounded shadow mb-6 overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              {["Month","Sales","Units Sold","Refund Cost","Refund Count","Refund %","COGS","Gross Profit","Gross %","Net Profit","Net %","ASP","Sellable Return %"].map(h=>(
                <th key={h} className="px-3 py-2 text-sm text-slate-600 border-b">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.month} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{m.month}</td>
                <td className="px-3 py-2">₹ {Number(m.sales || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{Number(m.unitsSold || 0).toLocaleString()}</td>
                <td className="px-3 py-2 text-rose-600">₹ {Number(m.refundAmount || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{m.refundCount || 0}</td>
                <td className="px-3 py-2">{Number(m.refundPercent || 0).toFixed(2)}%</td>
                <td className="px-3 py-2">₹ {Number(m.cogs || 0).toLocaleString()}</td>
                <td className="px-3 py-2">₹ {Number(m.grossProfit || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{Number(m.grossMargin || 0).toFixed(2)}%</td>
                <td className="px-3 py-2">₹ {Number(m.netProfit || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{Number(m.netMargin || 0).toFixed(2)}%</td>
                <td className="px-3 py-2">₹ {Number(m.asp || 0).toFixed(2)}</td>
                <td className="px-3 py-2">{Number(m.sellableReturnPercent || 0).toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Products */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Top Products by Quantity</h3>
          <ol className="list-decimal pl-5 text-sm">
            {topByQty.slice(0,10).map(p=>(
              <li key={p.sku} className="mb-2">
                <div className="font-medium">{p.sku}</div>
                <div className="text-xs text-slate-600">Qty: {p.qty.toLocaleString()} • Sales: ₹{p.sales.toLocaleString()}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Top Products by Profit</h3>
          <ol className="list-decimal pl-5 text-sm">
            {topByProfit.slice(0,10).map(p=>(
              <li key={p.sku} className="mb-2">
                <div className="font-medium">{p.sku}</div>
                <div className="text-xs text-slate-600">Profit: ₹{p.profit.toLocaleString()} • Sales: ₹{p.sales.toLocaleString()}</div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
