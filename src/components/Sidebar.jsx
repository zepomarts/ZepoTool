import { NavLink } from "react-router-dom";
import logo from "/zepo.png"; // keep your image in public root

export default function Sidebar() {
  const menu = [
    { label: "Dashboard", to: "/" },
    { label: "Amazon Upload", to: "/amazon/upload-fail" },
    { label: "Flipkart Upload", to: "/flipkart/upload-fail" },
    { label: "P&L Report", to: "/pnl-report" },
    { label: "Report", to: "/report" },
    { label: "Settings", to: "/setting" },
    { label: "Billing", to: "/billing" },
  ];

  return (
    <aside className="w-64 bg-[#0f2137] text-white min-h-screen p-6 flex flex-col">
      <div className="mb-8">
        <img src={logo} alt="ZepolTool" className="w-40 object-contain" />
      </div>

      <nav className="flex-1 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative block px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200
                ${isActive ? "bg-white text-[#0f2137] shadow-soft" : "text-gray-300 hover:bg-[#14253b]/80 hover:text-white"}`
            }
          >
            <span
              className="absolute left-0 top-0 h-full w-1 bg-green-400 rounded-r"
              style={{ transformOrigin: "center top", transform: "scaleY(1)" }}
            />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 text-xs text-gray-300">
        <div>Version: <span className="font-semibold">1.0</span></div>
        <div className="mt-3">© ZepolTool</div>
      </div>
    </aside>
  );
}
