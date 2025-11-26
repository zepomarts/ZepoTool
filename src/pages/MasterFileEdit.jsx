import { useEffect, useState } from "react";
import axios from "axios";

export default function MasterFileEdit() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_SERVER_URL}/api/master/view`).then((res) => {
      setRows(res.data);
    });
  }, []);

  const headers = rows[0] ? Object.keys(rows[0]) : [];

  const updateCell = (i, key, val) => {
    const updated = [...rows];
    updated[i][key] = val;
    setRows(updated);
  };

  const save = async () => {
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/master/save`, { rows });
    alert("Master updated!");
  };

  if (rows.length === 0) return <p>Loading...</p>;

  return (
    <div className="overflow-auto border p-4 bg-white shadow">
      <button
        onClick={save}
        className="mb-3 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save All
      </button>

      <table className="min-w-full border-collapse border">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="border px-3 py-2 bg-gray-100 text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h} className="border px-2 py-1">
                  <input
                    className="w-full p-1 border rounded"
                    value={typeof r[h] === "object" ? JSON.stringify(r[h]) : r[h]}
                    onChange={(e) => updateCell(i, h, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
