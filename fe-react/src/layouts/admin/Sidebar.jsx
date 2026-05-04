import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  PlusOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./index.scss";

const { Sider } = Layout;
const { SubMenu, Item } = Menu;

export default function Sidebar({ isCollapsed }) {
  const location = useLocation();

  const selectedKey = (() => {
    const p = location?.pathname || "/";
    if (p.includes("/product-list")) return "/admin/product-list";
    if (p.includes("/add-product")) return "/admin/add-product";
    if (p.includes("/admin/orders")) return "/admin/orders";
    if (p.includes("/admin/categories")) return "/admin/categories";
    if (p.includes("/admin/users")) return "/admin/users";
    if (p.includes("/dashboard")) return "/admin/dashboard";
    return "/admin/dashboard";
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
              defaultOpenKeys={["product", "order"]}
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
              </SubMenu>
              <SubMenu key="order" icon={<ShoppingOutlined />} title="Đơn Hàng">
                <Item key="/admin/orders" icon={<UnorderedListOutlined />}>
                  <Link to="/admin/orders">Danh Sách Đơn Hàng</Link>
                </Item>
              </SubMenu>
              <Item key="/admin/categories" icon={<AppstoreOutlined />}>
                <Link to="/admin/categories">Danh Mục</Link>
              </Item>
              <Item key="/admin/users" icon={<ProfileOutlined />}>
                <Link to="/admin/users">Người Dùng</Link>
              </Item>
            </Menu>
          </div>
        </div>
      </Sider>
    </div>
  );
}
