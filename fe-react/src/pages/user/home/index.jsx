import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row, Spin, Empty } from "antd";
import Product from "../../../components/user/productcard";
import { publicCategoryServices, publicProductServices } from "../../../api";
import "./index.scss";

const Home = () => {
  const navigate = useNavigate();

  // State quản lý
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingMap, setLoadingMap] = useState({});
  const [loadingCategories, setLoadingCategories] = useState(true);

  const getCategoryItems = async () => {
    setLoadingCategories(true);
    const response = await publicCategoryServices.getAll();
    setCategories(response?.items || []);
    setLoadingCategories(false);
  };

  // Lấy danh sách categories
  useEffect(() => {
    getCategoryItems();
  }, []);

  useEffect(() => {
    if (Array.isArray(categories) && categories.length > 0) {
      fetchProducts();
    }
  }, [categories]);

  // Lấy sản phẩm theo category
  const fetchProducts = async () => {
    const toFetch = categories.slice(0, 6);

    await Promise.all(
      toFetch.map(async (cat) => {
        setLoadingMap((prev) => ({ ...prev, [cat.id]: true }));

        try {
          const response = await publicProductServices.getProducts({
            category_id: cat.id,
            limit: 5,
          });

          setCategoryProducts((prev) => ({
            ...prev,
            [cat.id]: response?.data || [],
          }));

          console.log("Products for category", cat.id, response);
        } finally {
          setLoadingMap((prev) => ({ ...prev, [cat.id]: false }));
        }
      }),
    );
  };

  const onClickViewAll = (id) => navigate(`/${id}`);
  console.log(categoryProducts);

  return (
    <div className="home-page">
      <section className="home-banner">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1600&auto=format&fit=crop"
          alt="banner"
        />
      </section>
      <section className="featured">
        <h2>Sản phẩm nổi bật</h2>

        {/* Loading categories */}
        {loadingCategories ? (
          <Spin tip="Đang tải danh mục...">
            <div style={{ height: 100 }} />
          </Spin>
        ) : Array.isArray(categories) && categories.length > 0 ? (
          categories.slice(0, 6).map((c) => {
            const name = c.name || c;
            const products = categoryProducts[c.id] || [];

            return (
              <div className="featured-block" key={c.id}>
                <div className="featured-header">
                  <h3>{name}</h3>
                  <button onClick={() => onClickViewAll(c.id)}>
                    Xem tất cả
                  </button>
                </div>

                <Row gutter={24}>
                  {loadingMap[c.id] ? (
                    <Spin tip="Đang tải...">
                      <div style={{ height: 100 }} />
                    </Spin>
                  ) : Array.isArray(products) && products.length > 0 ? (
                    products.map((p) => (
                      <Col key={p.id} span={6}>
                        <Product
                          id={p.id}
                          name={p.name}
                          category={c.name}
                          brand={p.brand}
                          price={p.price}
                          discount={p.discount_percentage}
                          image={p.thumbnail_image}
                        />
                      </Col>
                    ))
                  ) : (
                    <Empty description="Không có sản phẩm" />
                  )}
                </Row>
              </div>
            );
          })
        ) : (
          <Empty description="Không có danh mục" />
        )}
      </section>
    </div>
  );
};

export default Home;
