import { useEffect, useState } from "react";
import {
  Button,
  Image,
  Input,
  InputNumber,
  Table,
  Select,
  Tag,
  Popconfirm,
  message,
  Pagination,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminCategoryServices, adminProductServices } from "../../../../api";
import "./index.scss";

const { Option } = Select;
const { Search } = Input;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const formatPrice = (v) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v,
  );

const ProductList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(undefined);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(undefined);
  const [priceMin, setPriceMin] = useState(undefined);
  const [priceMax, setPriceMax] = useState(undefined);
  const [priceMinInput, setPriceMinInput] = useState(undefined);
  const [priceMaxInput, setPriceMaxInput] = useState(undefined);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    adminCategoryServices.getAllCategories().then((res) => {
      setCategories(res.data ?? res.items ?? res ?? []);
    });
  }, []);

  const buildParams = (p = page, ps = pageSize) => {
    const params = { page: p, limit: ps, sort_by: sortBy };
    if (categoryId) params.category_id = categoryId;
    if (search) params.search = search;
    if (priceMin) params.min_price = priceMin;
    if (priceMax) params.max_price = priceMax;
    if (statusFilter) params.status = statusFilter;
    return params;
  };

  const fetchData = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const res = await adminProductServices.getAllProducts(buildParams(p, ps));
      setData(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    pageSize,
    sortBy,
    categoryId,
    search,
    priceMin,
    priceMax,
    statusFilter,
  ]);

  const handleDelete = async (id) => {
    try {
      await adminProductServices.deleteProduct(id);
      message.success("Xóa sản phẩm thành công");
      fetchData(page, pageSize);
    } catch {
      message.error("Xóa sản phẩm thất bại");
    }
  };

  const columns = [
    {
      title: "Sản phẩm",
      dataIndex: "name",
      minWidth: 280,
      render: (name, record) => (
        <div className="product-list__name-cell">
          <Image
            width={56}
            height={56}
            src={record.thumbnail_image || "/placeholder.png"}
            style={{
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid #f0f0f0",
              flexShrink: 0,
            }}
            preview={false}
            fallback="https://via.placeholder.com/56x56?text=No+Image"
          />
          <div className="product-list__name-info">
            <span className="product-list__name">{name}</span>
            {record.brand && (
              <span className="product-list__brand">{record.brand}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category_name",
      width: 140,
      render: (cat) => (
        <Tag color="blue" style={{ borderRadius: 20 }}>
          {cat || "—"}
        </Tag>
      ),
    },
    {
      title: "Giá bán",
      dataIndex: "price",
      width: 140,
      align: "right",
      render: (price) => (
        <span className="product-list__price">{formatPrice(price)}</span>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      width: 90,
      align: "center",
      render: (stock) => (
        <Tag color={stock === 0 ? "error" : stock < 10 ? "warning" : "success"}>
          {stock}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 120,
      align: "center",
      render: (status) => (
        <Tag
          color={status === "ACTIVE" ? "success" : "default"}
          style={{ borderRadius: 20 }}
        >
          {status === "ACTIVE" ? "Đang bán" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <div className="product-list__actions-cell">
          <Tooltip title="Xem chi tiết">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/admin/product-details/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/edit-product/${record.id}`)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Hành động này không thể hoàn tác."
            okText="Xóa"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleDelete(record.id)}
          >
            <Tooltip title="Xóa">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-product-list">
      {/* ── Header ── */}
      <div className="admin-product-list__header">
        <h2 className="admin-product-list__title">Danh sách sản phẩm</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/add-product")}
          size="large"
        >
          Thêm sản phẩm
        </Button>
      </div>

      {/* ── Filter bar ── */}
      <div className="admin-product-list__filters">
        <Search
          placeholder="Tên sản phẩm, thương hiệu..."
          allowClear
          style={{ width: 240 }}
          onSearch={(v) => {
            setSearch(v.trim());
            setPage(1);
          }}
        />
        <Select
          allowClear
          placeholder="Tất cả danh mục"
          value={categoryId}
          style={{ width: 180 }}
          onChange={(v) => {
            setCategoryId(v);
            setPage(1);
          }}
        >
          {categories.map((cat) => (
            <Option key={cat.id} value={cat.id}>
              {cat.name}
            </Option>
          ))}
        </Select>
        <Select
          allowClear
          placeholder="Trạng thái"
          value={statusFilter}
          style={{ width: 140 }}
          onChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <Option value="ACTIVE">Đang bán</Option>
          <Option value="INACTIVE">Ẩn</Option>
        </Select>
        <Select
          value={sortBy}
          style={{ width: 170 }}
          onChange={(v) => {
            setSortBy(v);
            setPage(1);
          }}
        >
          <Option value="newest">Mới nhất</Option>
          <Option value="price-asc">Giá tăng dần</Option>
          <Option value="price-desc">Giá giảm dần</Option>
        </Select>
        <div className="admin-product-list__price-range">
          <InputNumber
            min={0}
            placeholder="Giá từ"
            value={priceMinInput}
            style={{ width: 110 }}
            formatter={(v) =>
              v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            onChange={(v) => setPriceMinInput(v ?? undefined)}
          />
          <span className="admin-product-list__dash">–</span>
          <InputNumber
            min={0}
            placeholder="Giá đến"
            value={priceMaxInput}
            style={{ width: 110 }}
            formatter={(v) =>
              v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
            }
            onChange={(v) => setPriceMaxInput(v ?? undefined)}
          />
          <Button
            type="primary"
            onClick={() => {
              setPriceMin(priceMinInput);
              setPriceMax(priceMaxInput);
              setPage(1);
            }}
          >
            Áp dụng
          </Button>
        </div>
        {/* <Tooltip title="Làm mới">
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchData(page, pageSize)}
          />
        </Tooltip> */}
      </div>

      {/* ── Table ── */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        scroll={{ x: 900 }}
        className="admin-product-list__table"
      />

      {/* ── Pagination ── */}
      <div className="admin-product-list__pagination">
        <span className="admin-product-list__total">
          Tổng: {total} sản phẩm
        </span>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
          onShowSizeChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>
    </div>
  );
};

export default ProductList;
