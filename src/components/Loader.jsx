// src/components/Loader.jsx
export default function Loader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-10 animate-fade">
      <div className="flex gap-2">
        <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce1"></span>
        <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce2"></span>
        <span className="w-3 h-3 bg-blue-600 rounded-full animate-bounce3"></span>
      </div>
      <p className="text-gray-600 text-sm font-medium tracking-wide">
        Loading dashboard…
      </p>
    </div>
  );
}
