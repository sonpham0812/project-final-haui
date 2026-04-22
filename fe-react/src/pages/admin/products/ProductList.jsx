import { useEffect, useState } from "react";
import {
  Button,
  Image,
  Input,
  InputNumber,
  Table,
  Select,
  Popconfirm,
  message,
  Pagination,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { adminCategoryServices, adminProductServices } from "../../../api";

const { Option } = Select;
const { Search } = Input;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const ProductList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [rowSelection] = useState({});

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(undefined);
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState(undefined);
  const [priceMax, setPriceMax] = useState(undefined);
  // local input values – chưa commit vào API
  const [priceMinInput, setPriceMinInput] = useState(undefined);
  const [priceMaxInput, setPriceMaxInput] = useState(undefined);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState("newest");

  // Load categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminCategoryServices.getAllCategories();
        setCategories(res.items ?? res);
      } catch {
        message.error("Load categories failed");
      }
    };
    fetchCategories();
  }, []);

  const getData = async (params) => {
    try {
      setLoading(true);
      const res = await adminProductServices.getAllProducts(params);
      // backend returns { total, data, page, limit }
      setData(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      message.error("Load product failed");
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever any filter/sort/page changes
  useEffect(() => {
    const params = {
      page,
      limit: pageSize,
      sort_by: sortBy,
    };
    if (categoryId) params.category_id = categoryId;
    if (search) params.search = search;
    if (priceMin) params.min_price = priceMin;
    if (priceMax) params.max_price = priceMax;

    getData(params);
  }, [page, pageSize, sortBy, categoryId, search, priceMin, priceMax]);

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    setPage(1);
  };

  const handleSearch = (value) => {
    setSearch(value.trim());
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  const handlePriceChange = (type, value) => {
    if (type === "min") setPriceMinInput(value ?? undefined);
    else setPriceMaxInput(value ?? undefined);
  };

  const handleApplyPrice = () => {
    setPriceMin(priceMinInput);
    setPriceMax(priceMaxInput);
    setPage(1);
  };

  const handlePageChange = (newPage, newSize) => {
    setPage(newPage);
    setPageSize(newSize);
  };

  const handleDelete = async (id) => {
    try {
      await adminProductServices.deleteProduct(id);
      message.success("Delete product successfully");
      // Reload current page; if page becomes empty after delete, go back one page
      const params = {
        page,
        limit: pageSize,
        sort_by: sortBy,
      };
      if (categoryId) params.category_id = categoryId;
      if (search) params.search = search;
      if (priceMin) params.min_price = priceMin;
      if (priceMax) params.max_price = priceMax;
      getData(params);
    } catch {
      message.error("Delete product failed");
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Image width={48} src={record.thumbnail_image} />
          <Button type="link" href={`/admin/product-details/${record.id}`}>
            {text}
          </Button>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => <span>${price}</span>,
    },
    {
      title: "Category",
      dataIndex: "category_name",
      render: (cat) => <span className="text-gray-500">{cat}</span>,
    },
    {
      title: "Brand",
      dataIndex: "brand",
      render: (brand) => <span className="text-gray-500">{brand}</span>,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/edit-product/${record.id}`)}
          />
          <Popconfirm
            title="Xoá sản phẩm"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-4 rounded-lg shadow-sm">
        {/* Search */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Tìm kiếm</span>
          <Search
            placeholder="Tên sản phẩm, thương hiệu..."
            allowClear
            style={{ width: 260 }}
            onSearch={handleSearch}
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Category</span>
          <Select
            allowClear
            placeholder="All categories"
            value={categoryId}
            style={{ width: 180 }}
            onChange={handleCategoryChange}
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* Sort */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Sort by price</span>
          <Select
            value={sortBy}
            style={{ width: 160 }}
            onChange={handleSortChange}
          >
            <Option value="newest">Newest</Option>
            <Option value="price-asc">Price: Low → High</Option>
            <Option value="price-desc">Price: High → Low</Option>
          </Select>
        </div>

        {/* Price Range */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Price range ($)</span>
          <div className="flex items-center gap-2">
            <InputNumber
              min={0}
              placeholder="Min"
              value={priceMinInput}
              style={{ width: 100 }}
              onChange={(value) => handlePriceChange("min", value)}
            />
            <span className="text-gray-400">–</span>
            <InputNumber
              min={0}
              placeholder="Max"
              value={priceMaxInput}
              style={{ width: 100 }}
              onChange={(value) => handlePriceChange("max", value)}
            />
            <Button type="primary" onClick={handleApplyPrice}>
              Áp dụng
            </Button>
          </div>
        </div>
      </div>

      <Table
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={false}
      />

      <div className="flex justify-end bg-white p-3 rounded-lg shadow-sm">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          showTotal={(t) => `Total ${t} products`}
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ProductList;
