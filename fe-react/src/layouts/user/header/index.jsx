import { Avatar, Button, Flex, Input, Tooltip } from "antd";
import CategoryList from "./CategoryList";
import HeaderTop from "./HeaderTop";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { useState } from "react";
import { publicCategoryServices } from "../../../api";
import CartIcon from "../../../components/user/cart";
import { useMount } from "../../../utils";
import logo from "../../../assets/LogoMyBrand.png";

const Header = () => {
  const [categoryItems, setCategoryItems] = useState([]);

  const getCategoryItems = async () => {
    const response = await publicCategoryServices.getAll();
    const formattedItems = response?.items?.map((category) => ({
      label: category.name,
      key: category.id,
    }));
    setCategoryItems(formattedItems);
  };

  useMount(() => {
    getCategoryItems();
  });

  const navigate = useNavigate();

  const onSearch = (value) => {
    if (value.trim() !== "") {
      navigate(`/search?search=${encodeURIComponent(value.trim())}`);
    } else {
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.delete("search");
      const rest = currentParams.toString();
      navigate(`/search${rest ? `?${rest}` : ""}`);
    }
  };

  const onClick = (id) => navigate(`/search?category_id=${id}`);

  return (
    <div className="header py-m bg-main">
      <HeaderTop />
      <Flex justify="space-between" align="center">
        <Flex gap={2} align="center">
          {/* <CategoryList categoryItems={categoryItems} /> */}

          {/* ------ LOGO ------ */}
          <img
            src={logo}
            alt="logo thương hiệu"
            className="header-logo"
            onClick={() => navigate("/")}
          />
        </Flex>

        {/* Search */}
        <div className="search-categories">
          <Input.Search
            placeholder="Tìm kiếm sản phẩm bạn yêu thích"
            allowClear
            enterButton="Tìm Kiếm"
            size="large"
            onSearch={onSearch}
          />

          <Flex justify="space-between">
            {categoryItems?.slice(0, 10)?.map((item) => (
              <Button
                key={item.label}
                color="default"
                variant="link"
                onClick={() => onClick(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </Flex>
        </div>

        <CartIcon />
      </Flex>
    </div>
  );
};

export default Header;
