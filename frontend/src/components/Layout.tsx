import { Outlet } from "react-router-dom";
import TopBar from "./TopBar";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      <TopBar />
      <main id="main" className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
