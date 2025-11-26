import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  function money(v) {
    return "₹ " + Number(v || 0).toLocaleString();
  }

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/dashboard");
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.log("Dashboard error:", err);
      }
      setLoading(false);
    }
    loadDashboard();
  }, []);

  if (loading) return <Loader />;
  if (!data) return <div className="p-10 text-center text-red-600">No Data</div>;

  const t = data.totals;
  const margin = t.totalSales > 0 ? ((t.totalProfit / t.totalSales) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-10 text-gray-900">

      {/* HEADER TITLE */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">Your business performance summary</p>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <Card
          title="Total Sales"
          value={money(t.totalSales)}
          sub={`${t.totalOrders} orders`}
          icon="💰"
        />
        <Card
          title="Total Orders"
          value={t.totalOrders}
          sub={`${t.totalUnits || 0} units`}
          icon="📦"
        />
        <Card
          title="Total COGS"
          value={money(t.totalCogs)}
          icon="📉"
        />
        <Card
          title="Net Profit"
          value={money(t.totalProfit)}
          sub={`Margin: ${margin}%`}
          icon="📈"
        />
      </div>

      {/* SECOND ROW */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        <Card
          title="Refund Count"
          value={t.refundCount || 0}
          sub={money(t.refundLoss || 0)}
          icon="↩️"
        />
        <Card
          title="Units Sold"
          value={t.totalUnits || 0}
          icon="🛒"
        />
        <Card
          title="Profit Margin"
          value={`${margin}%`}
          icon="📊"
        />
      </div>

      {/* TOP SELLING & TOP PROFIT */}
      <div className="grid grid-cols-2 gap-10 mb-12">
        <ListCard
          title="🔥 Top Selling Products"
          rows={data.topSelling}
          f={(x) => `${x.sku} — ${x.qty}`}
        />
        <ListCard
          title="💸 Top Profit Products"
          rows={data.topProfit}
          f={(x) => `${x.sku} — ${money(x.profit)}`}
        />
      </div>

      {/* RECENT ORDERS */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border">
        <h2 className="font-semibold mb-4 text-lg">🕒 Recent Orders</h2>

        <div className="divide-y">
          {data.recent.map((r, i) => (
            <div
              key={i}
              className="py-3 flex justify-between text-sm hover:bg-gray-50 transition rounded px-2"
            >
              <span className="font-medium">{String(r.date).slice(0, 10)}</span>
              <span className="text-gray-700">{r.product_names}</span>
              <span className="font-semibold">{r.total_quantity}</span>
              <span className="font-bold text-indigo-600">
                {money(r.total_amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


/* -----------------------------
          CARD COMPONENT
------------------------------ */
function Card({ title, value, sub, icon }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-xl p-6 shadow-lg border 
                    hover:shadow-2xl hover:-translate-y-1 transition duration-200">

      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-600 font-medium">{title}</div>
        <div className="text-2xl">{icon}</div>
      </div>

      <div className="text-3xl font-extrabold text-gray-900">{value}</div>

      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}


/* -----------------------------
        LIST CARD COMPONENT
------------------------------ */
function ListCard({ title, rows, f }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>

      <ul className="text-sm space-y-2">
        {rows.map((r, i) => (
          <li
            key={i}
            className="text-gray-800 font-medium bg-gray-100 hover:bg-gray-200 
                       p-2 rounded transition"
          >
            {f(r)}
          </li>
        ))}
      </ul>
    </div>
  );
}
