import { useEffect, useState } from "react";
import axios from "axios";

export default function MasterFileView() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SERVER_URL}/api/master/view`).then((res) => {
      setRows(res.data);
    });
  }, []);

  if (!rows.length) return <p className="p-6">No master rows found.</p>;

  const headers = Object.keys(rows[0]);

  return (
    <div className="p-6 overflow-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Master File – View</h2>

      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="border px-3 py-2 text-left font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {headers.map((h, j) => (
                <td key={j} className="border px-3 py-1">
                  {typeof r[h] === "object" ? JSON.stringify(r[h]) : r[h]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
