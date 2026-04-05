import { useEffect, useState } from "react";
import {
  Input,
  Select,
  Upload,
  Button,
  Form,
  InputNumber,
  Card,
  Divider,
  message,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { adminCategoryServices, adminProductServices, adminUploadServices } from "../../../api";

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategory(true);
        const data = await adminCategoryServices.getAllCategories();
        setCategories(
          data.items.map((item) => ({
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
      try {
        setLoadingProduct(true);
        const product = await adminProductServices.getProductById(id);

        form.setFieldsValue({
          title: product.name,
          brand: product.brand,
          price: product.price,
          stock: product.stock,
          discount: product.discount_percentage,
          description: product.description,
          category: product.category_id,
          thumbnail: [
            {
              uid: "-1",
              name: "thumbnail",
              status: "done",
              url: product.thumbnail_image,
            },
          ],
          images: (product.images ?? []).map((img, index) => ({
            uid: index,
            name: `image-${index}`,
            status: "done",
            url: img,
          })),
        });
      } catch {
        message.error("Failed to load product");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [id, isEdit, form]);

  useEffect(() => {
    if (!isEdit) {
      form.resetFields();
    }
  }, [isEdit, form]);

  const handleSubmit = async (values) => {
    try {
      // Upload thumbnail
      const thumbnailFile = values.thumbnail[0];
      let thumbnailUrl = thumbnailFile.url; // If already uploaded
      
      if (thumbnailFile.originFileObj) {
        const thumbRes = await adminUploadServices.uploadImage(thumbnailFile.originFileObj);
        thumbnailUrl = thumbRes.imageUrl;
      }

      // Upload gallery images
      const imageUrls = await Promise.all(
        values.images.map(async (file) => {
          // If already uploaded, return existing URL
          if (file.url && !file.originFileObj) {
            return file.url;
          }
          // Upload new image
          const res = await adminUploadServices.uploadImage(file.originFileObj);
          return res.imageUrl;
        }),
      );

      const categoryItem = categories.find(
        (item) => item.value === values.category,
      );

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

      navigate("/product-list");
    } catch (error) {
      console.error(error);
      message.error("Submit failed");
    }
  };

  return (
    <div className="min-h-screen">
      <Card className="max-w-5xl mx-auto shadow-2xl rounded-3xl">
        <h1 className="text-3xl font-bold mb-6">
          {isEdit ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
        </h1>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loadingProduct}
        >
          <Divider orientation="left">Basic Information</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="title"
              label="Product Name"
              rules={[{ required: true }]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item name="brand" label="Brand">
              <Input size="large" />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true }]}
            >
              <Select
                size="large"
                options={categories}
                loading={loadingCategory}
              />
            </Form.Item>

            <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price ($)"
              rules={[{ required: true }]}
            >
              <InputNumber className="w-full" min={0} />
            </Form.Item>

            <Form.Item name="discount" label="Discount (%)">
              <InputNumber className="w-full" min={0} max={100} />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Divider orientation="left">Images</Divider>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="thumbnail"
              label="Thumbnail"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true }]}
            >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                maxCount={1}
              >
                <PlusOutlined />
              </Upload>
            </Form.Item>

            <Form.Item
              name="images"
              label="Gallery Images"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true }]}
            >
              <Upload
                listType="picture-card"
                multiple
                beforeUpload={() => false}
              >
                <UploadOutlined />
              </Upload>
            </Form.Item>
          </div>

          <div className="flex justify-center mt-10">
            <Button type="primary" size="large" htmlType="submit">
              {isEdit ? "Cập Nhật Sản Phẩm" : "Thêm Sản Phẩm"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
