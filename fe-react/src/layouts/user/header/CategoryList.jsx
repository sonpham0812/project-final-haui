import { Dropdown } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./index.scss";

const CategoryList = ({ categoryItems }) => {
  const navigate = useNavigate();

  const onClick = ({ key }) => {
    navigate(`/${key}`);
  };

  return (
    <Dropdown menu={{ items: categoryItems, onClick }} trigger={["click"]}>
      <a href="/" onClick={(e) => e.preventDefault()}>
        <MenuOutlined style={{ fontSize: "24px" }} />
      </a>
    </Dropdown>
  );
};

export default CategoryList;
