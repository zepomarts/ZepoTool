import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { label: "Dashboard", to: "/" },
    { label: "Amazon Upload Fail", to: "/amazon/upload-fail" },
    { label: "Flipkart Upload Fail", to: "/flipkart/upload-fail" },
    { label: "P&L Report", to: "/pnl-report" },
    { label: "Report", to: "/report" },
    { label: "Setting", to: "/setting" },
    { label: "Billing", to: "/billing" },
  ];

  return (
    <aside className="w-64 bg-[#0f2137] text-white min-h-screen p-6">
      <div className="flex justify-center mb-10">
        <img
          src="/zepo.png"
          alt="logo"
          className="max-w-[200px] h-auto object-contain drop-shadow-lg"
        />
      </div>

      <nav className="space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `relative block px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200 group
                ${
                  isActive
                    ? "bg-white text-[#0f2137] shadow-md font-semibold"
                    : "text-gray-300 hover:bg-[#1b2c45] hover:text-white"
                }`
            }
          >
            <span
              className="absolute left-0 top-0 h-full w-1 bg-green-400 
              scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r"
            ></span>

            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
