import { useEffect, useState } from "react";
import {
  Button,
  Image,
  Input,
  Table,
  Tag,
  Popconfirm,
  message,
  Pagination,
  Tooltip,
  Modal,
  Form,
  Upload,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { adminCategoryServices, adminUploadServices } from "../../../../api";
import "./index.scss";

const { Search } = Input;

const normFile = (e) => (Array.isArray(e) ? e : e?.fileList);

const CategoryList = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const res = await adminCategoryServices.getAllCategories({
        page: p,
        limit: pageSize,
        search,
      });
      setData(res.items ?? res.data ?? []);
      setTotal(res.pagination?.total ?? res.total ?? 0);
    } catch {
      message.error("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const openAdd = () => {
    setEditRecord(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditRecord(record);
    form.setFieldsValue({
      name: record.name,
      image: record.image
        ? [{ uid: "-1", name: "image", status: "done", url: record.image }]
        : [],
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      let imageUrl = editRecord?.image ?? null;
      const fileItem = values.image?.[0];
      if (fileItem?.originFileObj) {
        const res = await adminUploadServices.uploadCategoryImage(
          fileItem.originFileObj,
        );
        imageUrl = res.imageUrl;
      }

      if (editRecord) {
        await adminCategoryServices.updateCategory(editRecord.id, {
          name: values.name,
          image: imageUrl,
        });
        message.success("Cập nhật danh mục thành công");
      } else {
        await adminCategoryServices.createCategory({
          name: values.name,
          image: imageUrl,
        });
        message.success("Thêm danh mục thành công");
      }
      setModalOpen(false);
      fetchData(page);
    } catch {
      message.error("Thao tác thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHide = async (id) => {
    try {
      await adminCategoryServices.deleteCategory(id);
      message.success("Đã ẩn danh mục");
      fetchData(page);
    } catch {
      message.error("Ẩn danh mục thất bại");
    }
  };

  const handleRestore = async (id) => {
    try {
      await adminCategoryServices.updateCategory(id, { status: "ACTIVE" });
      message.success("Đã hiển thị lại danh mục");
      fetchData(page);
    } catch {
      message.error("Thao tác thất bại");
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 72,
      render: (img) => (
        <Image
          width={48}
          height={48}
          src={img || "/placeholder.png"}
          style={{
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #f0f0f0",
          }}
          preview={!!img}
          fallback="https://via.placeholder.com/48?text=No"
        />
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      render: (name) => <span className="cat-list__name">{name}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 130,
      align: "center",
      render: (s) => (
        <Tag
          color={s === "ACTIVE" ? "success" : "default"}
          style={{ borderRadius: 20 }}
        >
          {s === "ACTIVE" ? "Hiển thị" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div className="cat-list__actions">
          <Tooltip title="Chỉnh sửa">
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Ẩn danh mục?"
            description="Danh mục sẽ không hiển thị với người dùng."
            okText="Ẩn"
            okType="danger"
            cancelText="Hủy"
            onConfirm={() => handleHide(record.id)}
            disabled={record.status !== "ACTIVE"}
          >
            <Tooltip
              title={
                record.status === "ACTIVE" ? "Ẩn danh mục" : "Hiển thị lại"
              }
            >
              {record.status === "ACTIVE" ? (
                <Button size="small" danger icon={<EyeInvisibleOutlined />} />
              ) : (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  style={{ color: "#52c41a", borderColor: "#52c41a" }}
                  onClick={() => handleRestore(record.id)}
                />
              )}
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="cat-list-page">
      <div className="cat-list__toolbar">
        <h2 className="cat-list__title">Quản lý danh mục</h2>
        <div className="cat-list__toolbar-right">
          <Search
            placeholder="Tìm danh mục..."
            allowClear
            style={{ width: 240 }}
            onSearch={(v) => {
              setSearch(v);
              setPage(1);
            }}
          />
          <Tooltip title="Làm mới">
            <Button icon={<ReloadOutlined />} onClick={() => fetchData(page)} />
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>
            Thêm danh mục
          </Button>
        </div>
      </div>

      <div className="cat-list__card">
        <Table
          rowKey="id"
          loading={loading}
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
        />
        <div className="cat-list__pagination">
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showTotal={(t) => `${t} danh mục`}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={editRecord ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        okText={editRecord ? "Cập nhật" : "Thêm"}
        confirmLoading={submitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}
          >
            <Input placeholder="VD: Thời trang, Điện tử..." size="large" />
          </Form.Item>
          <Form.Item
            name="image"
            label="Ảnh đại diện"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload
              listType="picture-card"
              beforeUpload={() => false}
              maxCount={1}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8, fontSize: 12 }}>Tải lên</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
