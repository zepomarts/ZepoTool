import { useEffect, useState } from "react";
import axios from "axios";

export default function GlobalView() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/dashboard/global")
      .then(res => setRows(res.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">Global View</h1>

      <div className="bg-white p-4 rounded shadow">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2">Store</th>
              <th className="p-2">Revenue</th>
              <th className="p-2">Units Sold</th>
              <th className="p-2">COGS</th>
              <th className="p-2">Profit</th>
              <th className="p-2"># of SKU</th>
              <th className="p-2"># of Cost</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-2">{r.store}</td>
                <td className="p-2">${r.revenue}</td>
                <td className="p-2">{r.units}</td>
                <td className="p-2">${r.cogs}</td>
                <td className="p-2">${r.profit}</td>
                <td className="p-2">{r.skus}</td>
                <td className="p-2">{r.cogs_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
