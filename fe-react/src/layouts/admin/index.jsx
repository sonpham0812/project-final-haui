import { useState } from "react";
import Header from "../../layouts/admin/Header";
import Sidebar from "../../layouts/admin/Sidebar";
import "./index.scss";

export default function Layout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };
  return (
    <div className="layout-wrapper min-w-screen">
      <Header toggleSidebar={toggleSidebar} isCollapsed={isCollapsed} />
      <div className="layout-inner">
        <Sidebar isCollapsed={isCollapsed} />
        <div
          className={`layout-content ${isCollapsed ? "collapsed" : "expanded"} py-m`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
