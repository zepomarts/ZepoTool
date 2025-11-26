import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

  
export default function AmazonUploadFail() {
  const [selectedFilters, setSelectedFilters] = useState({ sku: "", type: "", date: "", asin: "", marketplace: "" });
  const [files, setFiles] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeSheet, setActiveSheet] = useState("order_summery");
  const [summary, setSummary] = useState(null); // holds summary (defaults + first sheet)
  const [sheetRows, setSheetRows] = useState([]); // rows for active sheet
  const [filteredRows, setFilteredRows] = useState(null); // after applying filters
  const [filters, setFilters] = useState({ skus: [], asins: [], marketplaces: [], types: [], dates: [] });
  const [loading, setLoading] = useState(false);
  const [loadingSheets, setLoadingSheets] = useState(false);
  const [error, setError] = useState(null);

const sheetNames = [
  "order_summery",          // EXACT backend key
  "order_unique_skus",
  "raw_concat",
  "sku_map",
  "negative_orders",
  "missing_cog_orders"
];


  useEffect(() => {
    loadFiles();  
  }, []);

async function loadFiles() {
  setLoading(true);
  try {
    const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/processed/list`);
    const json = await res.json();

    if (json.success) {
      setFiles(json.files || []);
    } else {
      setFiles([]);
    }

  } catch (err) {
    console.error("Failed to load files:", err);
    setFiles([]);
  } finally {
    setLoading(false);
  }
}


  // when a file is clicked, load summary and filters and default sheet
async function selectFile(fileId) {
  setSelectedFile(fileId);
  setSummary(null);
  setSheetRows([]);
  setFilteredRows(null);
  setFilters({ skus: [], asins: [], marketplaces: [], types: [], dates: [] });
  setTopSelling([]);

  try {
    setLoading(true);

    const [sRes, fRes, tRes] = await Promise.all([
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/processed/summary/${fileId}`),
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/processed/filters/${fileId}`),
      axios.get(`${import.meta.env.VITE_SERVER_URL}/api/processed/top-selling/${fileId}`)
    ]);

    // summary
    setSummary(sRes.data || null);

    // default table = order_summery
    if (sRes.data?.rows) {
      setSheetRows(sRes.data.rows);
    }

    // filters
    setFilters(fRes.data || { skus: [], asins: [], marketplaces: [], types: [], dates: [] });

    // top selling
    setTopSelling(tRes.data?.list || []);

  } catch (err) {
    console.error("selectFile error:", err);
    setError("Failed to load file details");
  } finally {
    setLoading(false);
  }
}



  // fetch rows for a particular sheet
  async function loadSheetRows(fileId, sheetName) {
    if (!fileId) return;
    setLoadingSheets(true);
    setFilteredRows(null);

    try {
      // Preferred: backend provides a sheet endpoint
      const res = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/processed/sheet/${fileId}/${sheetName}`);
      if (res.data?.rows) {
        setSheetRows(res.data.rows || []);
      } else if (Array.isArray(res.data)) {
        setSheetRows(res.data);
      } else if (res.data?.data) {
        setSheetRows(res.data.data || []);
      } else {
        // fallback: if sheet endpoint not implemented, try summary for order_summery
        if (sheetName === "order_summery") {
          const sumRes = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/processed/summary/${fileId}`)
;
          setSheetRows(sumRes.data?.rows || []);  
        } else {
          // no data available; set empty
          setSheetRows([]);
        }
      }

    } catch (err) {
      console.warn("sheet fetch fallback triggered or error:", err?.message || err);
      // fallback to empty
      setSheetRows([]);
    } finally {
      setLoadingSheets(false);
    }
  }

  // when active sheet changes (user clicks tab) reload rows
  useEffect(() => {
    if (!selectedFile) return; 
    setFilteredRows(null);
    loadSheetRows(selectedFile, activeSheet);
  }, [activeSheet, selectedFile]);

  // apply a filter (calls backend to compute aggregates + filtered rows)
  async function applyFilter(payload) {
    if (!selectedFile) return;
    const body = { fileId: selectedFile, ...(payload || {}) };
    setLoading(true);
    try {
  const res = await axios.post("${import.meta.env.VITE_SERVER_URL}/api/processed/filter-results", body);
      // endpoint returns { count, sales, cogs, profit, rows }
      if (res.data) {
        setFilteredRows(res.data.rows || []);
        // update summary totals to reflect filters
        setSummary(prev => ({
          ...prev,
          totalOrders: res.data.count ?? prev?.totalOrders,
          totalSales: res.data.sales ?? prev?.totalSales,
          totalCogs: res.data.cogs ?? prev?.totalCogs,
          totalProfit: res.data.profit ?? prev?.totalProfit
        }));
      }
    } catch (err) {
      console.error("applyFilter error:", err);
    } finally {
      setLoading(false);
    }
  }

  // quick helper to display rows: prefer filteredRows -> sheetRows
  const displayRows = useMemo(() => filteredRows ?? sheetRows ?? [], [filteredRows, sheetRows]);

  // small utility: render table from rows (dynamic columns)
  function DataTable({ rows }) {
    if (!rows || rows.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">No rows to show for this sheet.</div>
      );
    }

    const cols = Object.keys(rows[0]);

    return (
      <div className="overflow-auto max-h-[60vh]">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              {cols.map(c => (
                <th key={c} className="border px-2 py-2 text-left text-xs font-semibold">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                {cols.map(c => (
                  <td key={c} className="border px-2 py-1 text-xs align-top break-words max-w-[240px]">
                    {renderCell(r[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderCell(value) {
    if (value === null || value === undefined) return "";
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

 function FiltersPanel() {
  // If user selected another sheet than order_summery, show info
  if (activeSheet !== "order_summery") {
    return (
      <div className="w-72 border-l bg-white p-4 shadow-sm">
        <h3 className="font-bold mb-3">Filters</h3>
        <p className="text-xs text-gray-500">Filters available only for <b>order_summery</b>.</p>
      </div>
    );
  }

  // else show filters with bound values
  return (
    <div className="w-72 border-l bg-white p-4 shadow-sm">
      <h3 className="font-bold mb-3">Filters</h3>

      <label className="text-xs">SKU</label>
      <select
        className="w-full border p-2 mb-3 text-sm"
        value={selectedFilters.sku}
        onChange={e => {
          const v = e.target.value;
          setSelectedFilters(prev => ({ ...prev, sku: v }));
          applyFilter({ sku: v, type: selectedFilters.type, date: selectedFilters.date });
        }}
      >
        <option value="">All SKUs</option>
        {(filters.skus || []).map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <label className="text-xs">Type</label>
      <select
  className="w-full border p-2 mb-3 text-sm"
  value={selectedFilters.type}
  onChange={e => {
    const v = e.target.value;
    setSelectedFilters(prev => ({ ...prev, type: v }));
    applyFilter({
      sku: selectedFilters.sku,
      type: v,
      date: selectedFilters.date
    });
  }}
>
  <option value="">All Types</option>
  {(filters.types || []).map(t => (
    <option key={t} value={t.trim()}>{t}</option>
  ))}
</select>

{/* TOP SELLING PRODUCTS */}
<label className="text-xs">Top Selling Products</label>
<select
  className="w-full border p-2 mb-3 text-sm"
  value={selectedFilters.topSelling || ""}
  onChange={e => {
    const sku = e.target.value;
    setSelectedFilters(prev => ({ ...prev, topSelling: sku }));

    if (sku) {
      applyFilter({
        sku: sku, 
        type: selectedFilters.type,
        date: selectedFilters.date
      });
    } else {
      applyFilter({
        sku: "",
        type: selectedFilters.type,
        date: selectedFilters.date
      });
    }
  }}
>
  <option value="">All</option>
  {topSelling.map(item => (
    <option key={item.sku} value={item.sku}>
      {item.sku} — {item.qty} qty
    </option>
  ))}
</select>

      <label className="text-xs">Date</label>
      <select
        className="w-full border p-2 mb-3 text-sm"
        value={selectedFilters.date}
        onChange={e => {
          const v = e.target.value;
          setSelectedFilters(prev => ({ ...prev, date: v }));
          applyFilter({ sku: selectedFilters.sku, type: selectedFilters.type, date: v });
        }}
      >
        <option value="">All Dates</option>
        {(filters.dates || []).map(d => <option key={d} value={d}>{d}</option>)}
      </select>

      {/* Optional: ASIN and Marketplace (only if filters returned them) */}
      { (filters.asins && filters.asins.length) ? (
        <>
          <label className="text-xs">ASIN</label>
          <select className="w-full border p-2 mb-3 text-sm"
            value={selectedFilters.asin}
            onChange={e => {
              const v = e.target.value;
              setSelectedFilters(prev => ({ ...prev, asin: v }));
              applyFilter({ sku: selectedFilters.sku, type: selectedFilters.type, date: selectedFilters.date, asin: v });
            }}>
            <option value="">All ASINs</option>
            {filters.asins.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </>
      ) : null }

      { (filters.marketplaces && filters.marketplaces.length) ? (
        <>
          <label className="text-xs">Marketplace</label>
          <select className="w-full border p-2 mb-3 text-sm"
            value={selectedFilters.marketplace}
            onChange={e => {
              const v = e.target.value;
              setSelectedFilters(prev => ({ ...prev, marketplace: v }));
              applyFilter({ sku: selectedFilters.sku, type: selectedFilters.type, date: selectedFilters.date, marketplace: v });
            }}>
            <option value="">All</option>
            {filters.marketplaces.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </>
      ) : null }

      <button
        className="w-full mt-2 px-3 py-2 bg-gray-800 text-white rounded text-sm"
        onClick={() => {
          setSelectedFilters({ sku: "", type: "", date: "", asin: "", marketplace: "" });
          setFilteredRows(null);
          loadSheetRows(selectedFile, activeSheet);
        }}
      >
        Clear Filters
      </button>
    </div>
  );
}

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800">

      {/* Left: files list */}
      <div className="w-72 bg-white border-r p-4 overflow-auto">
        <h2 className="font-extrabold text-lg text-gray-700 mb-3">Processed Files</h2>

        {loading && files.length === 0 && <div className="text-sm text-gray-500">Loading...</div>}
        {!loading && files.length === 0 && <div className="text-sm text-gray-500">No files found.</div>}

        <div className="space-y-2">
          {files.map(f => (
            <div
              key={f.id || f._id}
              role="button"
              onClick={() => selectFile(f.id || f._id)}
              className={`p-3 rounded cursor-pointer border ${selectedFile === (f.id || f._id) ? 'bg-blue-600 text-white' : 'bg-white'}`}>
              <div className="font-semibold truncate">{f.filename || f.filename}</div>
              <div className="text-xs opacity-70">{f.rowsCount || 0} rows • {f.createdAt ? new Date(f.createdAt).toLocaleString() : ''}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <div>Screenshots (for dev):</div>
          <div className="break-words text-xxs mt-1">/mnt/data/Screenshot 2025-11-22 161817.png</div>
          <div className="break-words text-xxs">/mnt/data/Screenshot 2025-11-22 120912.png</div>
        </div>
      </div>

      {/* Middle: main panel */}
      <div className="flex-1 p-6 overflow-auto">
        {!selectedFile && (
          <div className="text-gray-500">Select a file from the left to view details.</div>
        )}

        {selectedFile && (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{summary?.filename || "Selected File"}</h1>
                <div className="text-sm text-gray-600 mt-1">{summary?.totalOrders ?? 0} orders • ₹{summary?.totalSales ?? 0} sales</div>
              </div>

              <div className="space-x-2">
                <button onClick={() => loadSheetRows(selectedFile, activeSheet)} className="px-3 py-2 border rounded text-sm">Refresh Sheet</button>
                <button onClick={() => {
                  // load insights (if backend offers insights)
                  axios.get(`/api/processed/insights/${selectedFile}`).then(r => {
                    if (r.data) {
                      // quick toast console
                      console.log('insights', r.data);
                      alert('Insights loaded to console');
                    }
                  }).catch(e => console.warn(e));
                }} className="px-3 py-2 bg-green-600 text-white rounded text-sm">Insights</button>
              </div>
            </div>

            {/* totals */}
            <div className="grid grid-cols-4 gap-4 my-4">
              <div className="p-3 bg-white rounded shadow">
                <div className="text-xs text-gray-500">Total Orders</div>
                <div className="font-semibold">{summary?.totalOrders ?? '-'}</div>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <div className="text-xs text-gray-500">Total Sales</div>
                <div className="font-semibold">₹{(Number(summary?.totalSales) || 0).toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <div className="text-xs text-gray-500">Total COGS</div>
                <div className="font-semibold">₹{(Number(summary?.totalCogs) || 0).toFixed(2)}</div>
              </div>
              <div className="p-3 bg-white rounded shadow">
                <div className="text-xs text-gray-500">Profit</div>
                <div className="font-semibold">₹{(Number(summary?.totalProfit) || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* sheet tabs */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {sheetNames.map(s => (
                  <button key={s} onClick={() => setActiveSheet(s)}
                    className={`px-3 py-1 rounded text-sm ${activeSheet === s ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                    {s.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* sheet header + table */}
            <div className="bg-white rounded shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{activeSheet.replace(/_/g, ' ')}</h3>
                <div className="text-xs text-gray-500">Rows: {displayRows.length}</div>
              </div>

              {loadingSheets ? (
                <div className="p-8 text-center">Loading sheet...</div>
              ) : (
                <DataTable rows={displayRows} />
              )}
            </div>
          </>
        )}

        {error && <div className="text-red-600 mt-3">{error}</div>}
      </div>

      {/* Right: filters */}
      <FiltersPanel />

    </div>
  );
}
