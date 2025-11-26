import React, { useState, useEffect } from "react";

export default function AmazonUploadFail() {
  const [file, setFile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchUploads = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/uploads`);
      const json = await res.json();
      const list = json?.data ?? json ?? [];
      setUploads(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err.message || "Failed to fetch uploads");
      setUploads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Choose a file first");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("marketplace", "amazon");

      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/uploads`, {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      await fetchUploads();
      setFile(null);
      alert("Upload successful");
    } catch (err) {
      setError(err.message || "Upload failed");
    }
  };

  return (
    <div className="p-10 min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-900">

      {/* HEADER */}
      <div className="mb-10">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Amazon Settlement Upload
        </h2>
        <p className="text-gray-600 mt-1">Upload & process Amazon settlement files</p>
      </div>

      {/* UPLOAD BOX */}
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-gray-200 mb-12">

        <div className="flex flex-wrap gap-5 items-center">

          {/* FILE INPUT */}
          <label className="flex-1">
            <div className="px-5 py-3 border border-gray-300 rounded-xl bg-white shadow-sm cursor-pointer hover:border-indigo-600 transition">
              <span className="text-gray-700 font-medium">
                {file ? file.name : "Choose .xlsx file"}
              </span>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>

          {/* UPLOAD BTN */}
          <button
            onClick={handleUpload}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-medium transition-transform hover:-translate-y-1"
          >
            Upload & Process
          </button>

          {/* PROCESSED OUTPUT BTN */}
          <button
            onClick={() => (window.location.href = "/amazon/processed-output")}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl shadow-md font-medium transition-transform hover:-translate-y-1"
          >
            Processed Output
          </button>

          {/* MASTER FILE BTN */}
          <button
            onClick={() => (window.location.href = "/amazon/master-file")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md font-medium transition-transform hover:-translate-y-1"
          >
            Master File
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200 shadow-sm">
            ❗ {error}
          </div>
        )}
      </div>

      {/* UPLOADED TABLE */}
      <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-2xl p-8 border border-gray-200">
        <h3 className="text-xl font-semibold mb-6">Uploaded Files</h3>

        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : uploads.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No files uploaded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-800 border-b">
                  <th className="p-3">#</th>
                  <th className="p-3">File Name</th>
                  <th className="p-3">Marketplace</th>
                  <th className="p-3">Rows</th>
                  <th className="p-3">Uploaded</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {uploads.map((u, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 transition">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">{u.originalname ?? u.filename}</td>
                    <td className="p-3 capitalize">{u.marketplace ?? "amazon"}</td>
                    <td className="p-3">{u.parsed?.length ?? "-"}</td>
                    <td className="p-3">{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-3">

                        {/* ANALYZE BTN */}
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_SERVER_URL}/api/analyze/${u._id}`)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow transition-transform hover:-translate-y-1 text-xs"
                        >
                          Analyze
                        </button>

                        {/* DELETE BTN */}
                        <button
                          onClick={async () => {
                            if (!confirm("Delete this file?")) return;
                            const res = await fetch(
                              `${import.meta.env.VITE_SERVER_URL}/api/uploads/${u._id}`,
                              { method: "DELETE" }
                            );
                            if (res.ok) fetchUploads();
                          }}
                          className="w-9 h-9 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow transition"
                        >
                          ✕
                        </button>

                        {/* DOWNLOAD BTN */}
                        <button
                          onClick={() => window.open(`${import.meta.env.VITE_SERVER_URL}/uploads/${u.filename}`)}
                          className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center shadow transition"
                        >
                          ⬇
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
}
