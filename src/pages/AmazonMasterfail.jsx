import { useEffect, useState } from "react";
import axios from "axios";

export default function MasterFilePage() {
  const [file, setFile] = useState(null);
  const [masterInfo, setMasterInfo] = useState(null);

  // View / Edit modes
  const [mode, setMode] = useState("none"); // none | view | edit
  const [rows, setRows] = useState([]);

  // Load master summary
  const loadMaster = async () => {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/master/info`);
    const json = await res.json();
    if (json.exists) setMasterInfo(json);
    else setMasterInfo(null);
  };
useEffect(() => {
  async function fetchData() {
    await loadMaster();
  }
  fetchData();
}, []);


  // Upload master file
  const uploadMaster = async () => {
    if (!file) return alert("Choose a file");

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/master/upload`, {
      method: "POST",
      body: form,
    });

    if (res.ok) {
      alert("Master uploaded!");
      setFile(null);
      setMode("none");
      loadMaster();
    } else {
      alert("Upload failed");
    }
  };

  // Load rows for View or Edit mode
  const loadRows = async () => {
    const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/master/view`);
    // backend returns { success, rows }
    setRows(res.data.rows || []);
  };

  // Save edited master file
  const saveRows = async () => {
    await axios.post(`${import.meta.env.VITE_SERVER_URL}/api/master/save`, { rows });
    alert("Master updated!");
    setMode("none");
    loadMaster();
  };

  const headers = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className="p-10">

      {/* PAGE HEADER */}
      <h2 className="text-3xl font-bold mb-2">Master File</h2>
      <p className="text-gray-500 mb-8">Upload or manage your Amazon master file</p>

      {/* UPLOAD BOX */}
      <div className="bg-white shadow border rounded-lg p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4">Upload New Master File</h3>

        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="border px-4 py-2 rounded-lg shadow-sm text-sm"
          />

          <button
            onClick={uploadMaster}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow"
          >
            Upload
          </button>
        </div>
      </div>

      {/* EXISTING MASTER CARD */}
      {masterInfo && mode === "none" && (
        <div className="bg-white shadow border rounded-lg p-6 w-fit">
          <h3 className="text-xl font-bold">{masterInfo.originalname}</h3>

          <p className="text-gray-500 text-sm mb-4">
            Uploaded on: {new Date(masterInfo.uploadedAt).toLocaleString()}
          </p>

          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => {
                loadRows();
                setMode("view");
              }}
            >
              View
            </button>

            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={() => {
                loadRows();
                setMode("edit");
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODE */}
      {mode === "view" && (
        <div className="bg-white p-6 mt-8 shadow rounded">
          <h3 className="text-xl font-bold mb-4">Master File – View</h3>

          <button
            onClick={() => setMode("none")}
            className="mb-3 bg-gray-700 text-white px-4 py-2 rounded"
          >
            Back
          </button>

          <div className="overflow-auto max-h-[70vh]">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {headers.map((h) => (
                    <th className="border px-4 py-2 text-left" key={h}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    {headers.map((h) => (
                      <td key={h} className="border px-4 py-1">
                        {typeof r[h] === "object"
                          ? JSON.stringify(r[h])
                          : r[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT MODE */}
      {mode === "edit" && (
        <div className="bg-white p-6 mt-8 shadow rounded">
          <h3 className="text-xl font-bold mb-4">Master File – Edit</h3>

          <div className="flex gap-3 mb-4">
            <button
              onClick={saveRows}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save All
            </button>

            <button
              onClick={() => setMode("none")}
              className="bg-gray-700 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>

          <div className="overflow-auto max-h-[70vh]">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  {headers.map((h) => (
                    <th className="border px-4 py-2 text-left" key={h}>
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
                          className="w-full border rounded px-2 py-1"
                          value={
                            typeof r[h] === "object"
                              ? JSON.stringify(r[h])
                              : r[h]
                          }
                          onChange={(e) => {
                            const updated = [...rows];
                            updated[i][h] = e.target.value;
                            setRows(updated);
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
