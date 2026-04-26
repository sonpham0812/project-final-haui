import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Col,
  Row,
  Select,
  InputNumber,
  Button,
  Pagination,
  Spin,
  Empty,
  Divider,
} from "antd";
import { publicCategoryServices, publicProductServices } from "../../../api";
import Product from "../../../components/user/productcard";
import "./index.scss";

const { Option } = Select;

const DEFAULT_PAGE_SIZE = 20;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ── filter state (committed → trigger API) ─────────────────────
  const search = searchParams.get("search") || "";
  const [categoryId, setCategoryId] = useState(
    () => searchParams.get("category_id") || undefined,
  );
  const [sortBy, setSortBy] = useState("newest");
  const [priceMin, setPriceMin] = useState(undefined);
  const [priceMax, setPriceMax] = useState(undefined);

  // local input for price
  const [priceMinInput, setPriceMinInput] = useState(undefined);
  const [priceMaxInput, setPriceMaxInput] = useState(undefined);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(DEFAULT_PAGE_SIZE);

  // ── data state ─────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Load categories once
  useEffect(() => {
    publicCategoryServices.getAll().then((res) => {
      setCategories(res?.items ?? []);
    });
  }, []);

  // Fetch products on filter/page change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = { page, limit: pageSize, sort_by: sortBy };
        if (search) params.search = search;
        if (categoryId) params.category_id = categoryId;
        if (priceMin) params.min_price = priceMin;
        if (priceMax) params.max_price = priceMax;

        const res = await publicProductServices.getProducts(params);
        setProducts(res?.data ?? []);
        setTotal(res?.total ?? 0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, pageSize, sortBy, categoryId, priceMin, priceMax, search]);

  const handleCategoryChange = (val) => {
    setCategoryId(val);
    setPage(1);
    // sync URL
    const next = new URLSearchParams(searchParams);
    if (val) next.set("category_id", val);
    else next.delete("category_id");
    setSearchParams(next);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handleApplyPrice = () => {
    setPriceMin(priceMinInput);
    setPriceMax(priceMaxInput);
    setPage(1);
  };

  return (
    <div className="search-page">
      <Row gutter={24}>
        {/* ── Sidebar bộ lọc ── */}
        <Col
          span={6}
          style={{ alignSelf: "flex-start", position: "sticky", top: 198 }}
        >
          <div className="search-sidebar">
            <h3>Bộ lọc tìm kiếm</h3>
            <Divider />

            {/* Category */}
            <div className="filter-group">
              <p className="filter-label">Danh mục</p>
              <Select
                allowClear
                placeholder="Tất cả danh mục"
                value={categoryId}
                style={{ width: "100%" }}
                onChange={handleCategoryChange}
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </div>

            <Divider />

            {/* Sort */}
            <div className="filter-group">
              <p className="filter-label">Sắp xếp theo</p>
              <Select
                value={sortBy}
                style={{ width: "100%" }}
                onChange={handleSortChange}
              >
                <Option value="newest">Mới nhất</Option>
                <Option value="price-asc">Giá: Thấp → Cao</Option>
                <Option value="price-desc">Giá: Cao → Thấp</Option>
                <Option value="discount">Giảm giá nhiều nhất</Option>
              </Select>
            </div>

            <Divider />

            {/* Price range */}
            <div className="filter-group">
              <p className="filter-label">Khoảng giá</p>
              <div className="price-inputs">
                <InputNumber
                  min={0}
                  placeholder="Từ"
                  value={priceMinInput}
                  style={{ width: "calc(50% - 10px)" }}
                  onChange={(v) => setPriceMinInput(v ?? undefined)}
                />
                <span className="price-sep">–</span>
                <InputNumber
                  min={0}
                  placeholder="Đến"
                  value={priceMaxInput}
                  style={{ width: "calc(50% - 10px)" }}
                  onChange={(v) => setPriceMaxInput(v ?? undefined)}
                />
              </div>
              <Button
                type="primary"
                block
                style={{ marginTop: 10 }}
                onClick={handleApplyPrice}
              >
                Áp dụng
              </Button>
            </div>
          </div>
        </Col>

        {/* ── Kết quả tìm kiếm ── */}
        <Col span={18}>
          <div className="search-results">
            <div className="search-results-header">
              {search ? (
                <h2>
                  Kết quả tìm kiếm cho{" "}
                  <span className="search-keyword">&ldquo;{search}&rdquo;</span>
                </h2>
              ) : (
                <h2>Tất cả sản phẩm</h2>
              )}
              <span className="result-count">{total} sản phẩm</span>
            </div>

            {loading && (
              <div className="search-loading">
                <Spin size="large" />
              </div>
            )}
            {!loading && products.length === 0 && (
              <Empty description="Không tìm thấy sản phẩm nào" />
            )}
            {!loading && products.length > 0 && (
              <>
                <Row gutter={[16, 16]}>
                  {products.map((p) => (
                    <Col key={p.id} span={24 / 5}>
                      <Product
                        id={p.id}
                        name={p.name}
                        category={p.category_name}
                        brand={p.brand}
                        price={p.price}
                        discount={p.discount_percentage}
                        image={p.thumbnail_image}
                      />
                    </Col>
                  ))}
                </Row>

                <div className="search-pagination">
                  <Pagination
                    current={page}
                    pageSize={pageSize}
                    total={total}
                    showTotal={(t) => `Tổng ${t} sản phẩm`}
                    onChange={(p) => setPage(p)}
                  />
                </div>
              </>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SearchPage;
