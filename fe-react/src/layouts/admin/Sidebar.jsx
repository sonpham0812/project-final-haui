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
              <Item key="/dashboard" icon={<DashboardOutlined />}>
                <Link to="/dashboard">Dashboard</Link>
              </Item>
              <SubMenu
                key="product"
                icon={<AppstoreOutlined />}
                title="Product"
              >
                <Item key="/product-list" icon={<UnorderedListOutlined />}>
                  <Link to="/product-list">Product list</Link>
                </Item>
                <Item key="/add-product" icon={<PlusOutlined />}>
                  <Link to="/add-product">Add product</Link>
                </Item>
                <Item key="/edit-product" icon={<EditOutlined />}>
                  <Link to="/edit-product">Edit product</Link>
                </Item>
              </SubMenu>
            </Menu>
          </div>
        </div>
      </Sider>
    </div>
  );
}
