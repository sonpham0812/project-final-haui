import { useEffect, useMemo, useState } from "react";
import { productServices } from "../../api/products";
import {
  Button,
  Image,
  Table,
  Tag,
  Select,
  Slider,
  Popconfirm,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

const ProductList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 200]);

  const handleRowSelectionChange = (enable) => {
    setRowSelection(enable ? {} : undefined);
  };

  const getData = async () => {
    try {
      setLoading(true);
      const res = await productServices.getProducts();
      setData(res);
    } catch (error) {
      message.error("Load product failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productServices.deleteProduct(id);
      message.success("Delete product successfully");
      getData();
    } catch (error) {
      message.error("Delete product failed");
    }
  };

  const categories = useMemo(() => {
    return ["all", ...new Set(data.map((item) => item.category))];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchCategory = category === "all" || item.category === category;
      const matchPrice =
        item.price >= priceRange[0] && item.price <= priceRange[1];

      return matchCategory && matchPrice;
    });
  }, [data, category, priceRange]);

  const columns = [
    {
      title: "Product",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Image width={48} src={record.thumbnail} />
          <Button type="link" href={`/product-details/${record.id}`}>
            {text}
          </Button>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      sorter: (a, b) => a.price - b.price,
      render: (price) => <span>${price}</span>,
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (cat) => <span className="text-gray-500">{cat}</span>,
    },
    {
      title: "Tags",
      dataIndex: "tags",
      render: (tags) => (
        <div className="flex flex-row gap-1">
          {tags.map((tag) => (
            <Tag key={tag} color="blue">
              {tag}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`/edit-product/${record.id}`)}
          />
          <Popconfirm
            title="Delete product"
            description="Are you sure to delete this product?"
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

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="space-y-4">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-6 bg-white p-4 rounded-lg shadow-sm">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">Category</span>
          <Select
            value={category}
            style={{ width: 180 }}
            onChange={setCategory}
          >
            {categories.map((cat) => (
              <Option key={cat} value={cat}>
                {cat}
              </Option>
            ))}
          </Select>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-1 w-64">
          <span className="text-sm text-gray-500">
            Price range (${priceRange[0]} - ${priceRange[1]})
          </span>
          <Slider
            range
            min={0}
            max={200}
            value={priceRange}
            onChange={setPriceRange}
          />
        </div>
      </div>

      <Table
        rowKey="id"
        rowSelection={rowSelection}
        loading={loading}
        columns={columns}
        dataSource={filteredData}
      />
    </div>
  );
};

export default ProductList;
