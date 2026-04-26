import { Avatar, Button, Flex, Input, Tooltip } from "antd";
import CategoryList from "./CategoryList";
import HeaderTop from "./HeaderTop";
import { useNavigate } from "react-router-dom";
import "./index.scss";
import { useState } from "react";
import { publicCategoryServices } from "../../../api";
import CartIcon from "../../../components/user/cart";
import { useMount } from "../../../utils";
import useAuth from "../../../hooks/useAuth";

const Header = () => {
  const [categoryItems, setCategoryItems] = useState([]);
  const { user, isAuthenticated } = useAuth();

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

  const onClick = (category) => {
    navigate(`/${category}`);
  };

  const avatarLetter =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U";

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

        <Flex align="center" gap={16}>
          <CartIcon />
          {isAuthenticated && (
            <Tooltip title="Trang cá nhân" placement="bottom">
              <Avatar
                className="header-user-avatar"
                size={42}
                onClick={() => navigate("/profile")}
                style={{
                  backgroundColor: "#f56a00",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {avatarLetter}
              </Avatar>
            </Tooltip>
          )}
        </Flex>
      </Flex>
    </div>
  );
};

export default Header;
