import { Layout, Menu, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShopOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./index.scss";

const { Sider } = Layout;
const { SubMenu, Item } = Menu;

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();

  const selectedKey = (() => {
    const p = location?.pathname || "/";
    if (p.includes("/product-list")) return "/product-list";
    if (p.includes("/add-product")) return "/add-product";
    if (p.includes("/ecommerce")) return "/ecommerce";
    if (p.includes("/dashboard")) return "/dashboard";
    if (p.includes("/edit-product")) return "/edit-product";
    return "/dashboard";
  })();

  return (
    <div className="sidebar-wrapper">
      <Sider
        trigger={null}
        collapsible
        collapsed={isCollapsed}
        collapsedWidth={80}
      >
        <div className="sidebar-inner">
          <div className="menu-container">
            <Menu
              mode="inline"
              inlineCollapsed={isCollapsed}
              selectedKeys={[selectedKey]}
              defaultOpenKeys={["product"]}
            >
              <Item key="/admin/dashboard" icon={<DashboardOutlined />}>
                <Link to="/admin/dashboard">Bảng Điều Khiển</Link>
              </Item>
              <SubMenu
                key="product"
                icon={<AppstoreOutlined />}
                title="Sản Phẩm"
              >
                <Item
                  key="/admin/product-list"
                  icon={<UnorderedListOutlined />}
                >
                  <Link to="/admin/product-list">Danh Sách Sản Phẩm</Link>
                </Item>
                <Item key="/admin/add-product" icon={<PlusOutlined />}>
                  <Link to="/admin/add-product">Thêm Sản Phẩm</Link>
                </Item>
                {/* <Item key="/admin/edit-product" icon={<EditOutlined />}>
                  <Link to="/admin/edit-product">Chỉnh Sửa Sản Phẩm</Link>
                </Item> */}
              </SubMenu>
            </Menu>
          </div>
        </div>
      </Sider>
    </div>
  );
}
