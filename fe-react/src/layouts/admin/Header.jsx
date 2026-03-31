import {
  BellFilled,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Input } from "antd";

export default function Header({ toggleSidebar, isCollapsed }) {
  return (
    <div className="sticky top-0 flex flex-row justify-end bg-(--main-color) z-50 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]">
      <div className="flex flex-row justify-between items-center py-4 w-full">
        <div className={`flex flex-row ${isCollapsed ? "gap-9" : "gap-28"}`}>
          <div
            className={`flex items-center justify-between ${
              isCollapsed ? "ml-6" : "ml-5"
            }`}
          >
            <Button
              type="text"
              onClick={toggleSidebar}
              icon={
                isCollapsed ? (
                  <MenuUnfoldOutlined style={{ fontSize: 16 }} />
                ) : (
                  <MenuFoldOutlined style={{ fontSize: 16 }} />
                )
              }
              className="!text-gray-600"
            />
            <div className="flex items-center gap-3">
              {/* <div className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold shadow"></div> */}
              {!isCollapsed && (
                <span className="text-xl font-bold text-blue-600">Falcon</span>
              )}
            </div>
          </div>
          <Input.Search
            placeholder="Search anything..."
            allowClear
            enterButton
            style={{ width: 256 }}
          />
        </div>
        <div className="flex flex-row gap-4 items-center">
          <BellFilled style={{ fontSize: 32 }} />
          <Avatar
            style={{ backgroundColor: "#87d068" }}
            icon={<UserOutlined />}
          />
        </div>
      </div>
    </div>
  );
}
