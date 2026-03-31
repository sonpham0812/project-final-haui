import { useState } from "react";
import Header from "../../layouts/admin/Header";
import Sidebar from "../../layouts/admin/Sidebar";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
  return (
    <div className="relative mx-16">
      <Header toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className="flex flex-row">
        <Sidebar isCollapsed={isCollapsed} />
        <div
          className={`w-full pt-5 ${isCollapsed ? "ml-[96px]" : "ml-[224px]"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
