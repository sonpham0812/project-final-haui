import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Col, Row, Spin, Empty, Carousel, Button } from "antd";
import Product from "../../../components/user/productcard";
import { publicCategoryServices, publicProductServices } from "../../../api";
import bannerXmas from "../../../assets/banner_xmas.png";
import bannerValentine from "../../../assets/banner_valentine.png";
import bannerSummer from "../../../assets/banner_summer.png";
import bannerNewyear from "../../../assets/banner_newyear.png";
import bannerEndyear from "../../../assets/banner_endyear.png";
import bannerTech from "../../../assets/banner_tech.png";
import bannerFamily from "../../../assets/banner_family.png";
import "./index.scss";

const BANNERS = [
  bannerXmas,
  bannerValentine,
  bannerSummer,
  bannerNewyear,
  bannerEndyear,
];

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
            limit: 6,
          });

          setCategoryProducts((prev) => ({
            ...prev,
            [cat.id]: response?.data || [],
          }));
        } finally {
          setLoadingMap((prev) => ({ ...prev, [cat.id]: false }));
        }
      }),
    );
  };

  const onClickViewAll = (id) => navigate(`/search?category_id=${id}`);

  return (
    <div className="home-page">
      <div className="home-banner-wrapper">
        <Row gutter={16}>
          <Col span={16}>
            <Carousel autoplay autoplaySpeed={2000} arrows infinite>
              {BANNERS.map((src, idx) => (
                <div key={`banner-${idx}`} className="home-banner__slide">
                  <img src={src} alt={`banner-${idx + 1}`} />
                </div>
              ))}
            </Carousel>
          </Col>
          <Col span={8} className="side-banners">
            <img src={bannerTech} alt="Khuyến mãi công nghệ" />
            <img src={bannerFamily} alt="Khuyến mãi gia đình" />
          </Col>
        </Row>
      </div>
      <section className="featured">
        <div className="product-start">
          <h3>Sản phẩm nổi bật</h3>
        </div>

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
                  <Button onClick={() => onClickViewAll(c.id)}>
                    Xem tất cả
                  </Button>
                </div>

                <Row gutter={[16, 16]}>
                  {loadingMap[c.id] ? (
                    <Spin tip="Đang tải...">
                      <div style={{ height: 100 }} />
                    </Spin>
                  ) : Array.isArray(products) && products.length > 0 ? (
                    products.map((p) => (
                      <Col key={p.id} span={4}>
                        <Product
                          id={p.id}
                          name={p.name}
                          category={c.name}
                          brand={p.brand}
                          price={p.price}
                          discount={p.discount_percentage}
                          image={p.thumbnail_image}
                          soldCount={p.sold_count}
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
