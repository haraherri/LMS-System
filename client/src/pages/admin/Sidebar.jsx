import { ChartNoAxesColumn, SquareLibrary } from "lucide-react";
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex flex-col w-64 shadow-xl">
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold tracking-wider text-blue-500">
            LMS
          </h1>
        </div>
        <nav className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex-1 overflow-y-auto py-8">
          <Link
            to="dashboard"
            className={`flex items-center gap-4 px-6 py-3 transition-colors duration-300 ${
              location.pathname.includes("dashboard")
                ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-500"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <ChartNoAxesColumn
              size={24}
              className="text-gray-600 dark:text-gray-400"
            />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="course"
            className={`flex items-center gap-4 px-6 py-3 transition-colors duration-300 ${
              location.pathname.includes("course")
                ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-500"
                : "hover:bg-gray-200 dark:hover:bg-gray-800"
            }`}
          >
            <SquareLibrary
              size={24}
              className="text-gray-600 dark:text-gray-400"
            />
            <span className="font-medium">Courses</span>
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-gray-50 dark:bg-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
