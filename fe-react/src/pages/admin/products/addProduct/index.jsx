import { useEffect, useState } from "react";
import {
  Input,
  Select,
  Upload,
  Button,
  Form,
  InputNumber,
  Divider,
  message,
  Spin,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { adminCategoryServices, adminProductServices, adminUploadServices } from "../../../../api";
import "./index.scss";

const { TextArea } = Input;

const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

export default function AddProduct() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategory(true);
      try {
        const data = await adminCategoryServices.getAllCategories();
        setCategories(
          (data.items ?? data.data ?? data).map((item) => ({
            label: item.name,
            value: item.id,
          })),
        );
      } catch {
        message.error("Không thể tải danh mục");
      } finally {
        setLoadingCategory(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    const fetchProduct = async () => {
      setLoadingProduct(true);
      try {
        const product = await adminProductServices.getProductById(id);
        form.setFieldsValue({
          title: product.name,
          brand: product.brand,
          price: product.price,
          stock: product.stock,
          discount: product.discount_percentage,
          description: product.description,
          category: product.category_id,
          thumbnail: [{ uid: "-1", name: "thumbnail", status: "done", url: product.thumbnail_image }],
          images: (product.images ?? []).map((img, index) => ({
            uid: index, name: `image-${index}`, status: "done", url: img,
          })),
        });
      } catch {
        message.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoadingProduct(false);
      }
    };
    fetchProduct();
  }, [id, isEdit, form]);

  useEffect(() => {
    if (!isEdit) form.resetFields();
  }, [isEdit, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const thumbnailFile = values.thumbnail[0];
      let thumbnailUrl = thumbnailFile.url;
      if (thumbnailFile.originFileObj) {
        const res = await adminUploadServices.uploadImage(thumbnailFile.originFileObj);
        thumbnailUrl = res.imageUrl;
      }

      const imageUrls = await Promise.all(
        values.images.map(async (file) => {
          if (file.url && !file.originFileObj) return file.url;
          const res = await adminUploadServices.uploadImage(file.originFileObj);
          return res.imageUrl;
        }),
      );

      const categoryItem = categories.find((c) => c.value === values.category);
      const payload = {
        name: values.title,
        description: values.description,
        price: values.price,
        discount_percentage: values.discount || 0,
        stock: values.stock,
        category_id: categoryItem.value,
        brand: values.brand || "",
        thumbnail_image: thumbnailUrl,
        images: imageUrls,
      };

      if (isEdit) {
        await adminProductServices.updateProduct(id, payload);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await adminProductServices.createProduct(payload);
        message.success("Thêm sản phẩm thành công");
      }
      navigate("/admin/product-list");
    } catch (err) {
      console.error(err);
      message.error("Thao tác thất bại, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page">
      {/* ── Topbar ── */}
      <div className="add-product__topbar">
        <button className="add-product__back" onClick={() => navigate("/admin/product-list")}>
          <ArrowLeftOutlined /> Danh sách sản phẩm
        </button>
        <span className="add-product__topbar-title">
          {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </span>
        <div />
      </div>

      <div className="add-product__body">
        <Spin spinning={loadingProduct} tip="Đang tải...">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loadingProduct}
          >
            {/* ── Section 1: Thông tin cơ bản ── */}
            <div className="add-product__card">
              <Divider orientation="left" orientationMargin={0}>
                <span className="add-product__section-title">Thông tin cơ bản</span>
              </Divider>
              <div className="add-product__grid">
                <Form.Item
                  name="title"
                  label="Tên sản phẩm"
                  rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                >
                  <Input size="large" placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item name="brand" label="Thương hiệu">
                  <Input size="large" placeholder="VD: Nike, Samsung..." />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Danh mục"
                  rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
                >
                  <Select
                    size="large"
                    options={categories}
                    loading={loadingCategory}
                    placeholder="Chọn danh mục"
                  />
                </Form.Item>

                <Form.Item
                  name="stock"
                  label="Số lượng tồn kho"
                  rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    placeholder="0"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  name="price"
                  label="Giá bán (VNĐ)"
                  rules={[{ required: true, message: "Vui lòng nhập giá bán" }]}
                >
                  <InputNumber
                    size="large"
                    min={0}
                    placeholder="0"
                    style={{ width: "100%" }}
                    formatter={(v) => v ? `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""}
                  />
                </Form.Item>

                <Form.Item name="discount" label="Giảm giá (%)">
                  <InputNumber
                    size="large"
                    min={0}
                    max={100}
                    placeholder="0"
                    style={{ width: "100%" }}
                    addonAfter="%"
                  />
                </Form.Item>
              </div>

              <Form.Item
                name="description"
                label="Mô tả sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
              >
                <TextArea rows={5} placeholder="Nhập mô tả chi tiết sản phẩm..." />
              </Form.Item>
            </div>

            {/* ── Section 2: Hình ảnh ── */}
            <div className="add-product__card">
              <Divider orientation="left" orientationMargin={0}>
                <span className="add-product__section-title">Hình ảnh sản phẩm</span>
              </Divider>
              <div className="add-product__images-grid">
                <div>
                  <p className="add-product__upload-label">Ảnh đại diện <span className="required">*</span></p>
                  <Form.Item
                    name="thumbnail"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "Vui lòng chọn ảnh đại diện" }]}
                  >
                    <Upload listType="picture-card" beforeUpload={() => false} maxCount={1}>
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>

                <div>
                  <p className="add-product__upload-label">Bộ ảnh sản phẩm <span className="required">*</span></p>
                  <Form.Item
                    name="images"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất 1 ảnh" }]}
                  >
                    <Upload listType="picture-card" multiple beforeUpload={() => false}>
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8, fontSize: 12 }}>Tải lên</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </div>
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="add-product__footer">
              <Button size="large" onClick={() => navigate("/admin/product-list")}>
                Hủy bỏ
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={submitting}
                style={{ minWidth: 160 }}
              >
                {isEdit ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
              </Button>
            </div>
          </Form>
        </Spin>
      </div>
    </div>
  );
}
