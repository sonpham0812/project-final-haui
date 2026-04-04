import { Button, Flex, Input } from "antd";
import CategoryList from "./CategoryList";
import HeaderTop from "./HeaderTop";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { useEffect, useState } from "react";
import { publicCategoryServices } from "../../../api";
import CartIcon from "../../../components/user/cart";

const Header = () => {
  const [categoryItems, setCategoryItems] = useState([]);

  const getCategoryItems = async () => {
    const response = await publicCategoryServices.getAll();
    const formattedItems = response.data.map((category) => ({
      label: category.name,
      key: category.id,
    }));
    setCategoryItems(formattedItems);
  };

  useEffect(() => {
    getCategoryItems();
  }, []);

  const navigate = useNavigate();

  const onSearch = (value) => {
    if (value.trim() !== "") {
      navigate(`/search/${value}`);
    }
  };

  const onClick = (category) => {
    navigate(`/${category}`);
  };

  return (
    <div className="header py-m bg-main">
      <HeaderTop />
      <Flex justify="space-between" align="center">
        <Flex gap={2} align="center">
          <CategoryList categoryItems={categoryItems} />

          {/* ------ LOGO ------ */}
          <img
            src="/LogoMyBrand.png"
            alt="brand logo"
            className="header-logo"
            onClick={() => navigate("/")}
          />
        </Flex>

        {/* Search */}
        <div className="search-categories">
          <Input.Search
            placeholder="Search your preferred items here"
            allowClear
            enterButton="Search"
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
