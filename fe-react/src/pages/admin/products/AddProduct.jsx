import React, { useEffect, useState } from "react";
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
import { productServices } from "../../api/products";
import { categoryServices } from "../../api/categories";
import { useNavigate, useParams } from "react-router-dom";

const { TextArea } = Input;

// save image to base 64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const normFile = (e) => {
  if (Array.isArray(e)) return e;
  return e?.fileList;
};

export default function AddProduct() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategory(true);
        const data = await categoryServices.getAll();
        setCategories(
          data.map((item) => ({
            label: item.name,
            value: item.id,
            slug: item.slug,
          })),
        );
      } catch {
        message.error("Failed to load categories");
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
        const product = await productServices.getProductDetails(id);

        setTags(product.tags || []);

        form.setFieldsValue({
          title: product.title,
          brand: product.brand,
          price: product.price,
          stock: product.stock,
          discount: product.discountPercentage,
          description: product.description,
          category: product.categoryId,
          dimensions: product.dimensions,
          thumbnail: [
            {
              uid: "-1",
              name: "thumbnail",
              status: "done",
              url: product.thumbnail,
            },
          ],
          images: (product.images || []).map((img, index) => ({
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
      setTags([]);
    }
  }, [isEdit, form]);

  const handleSubmit = async (values) => {
    try {
      const imagesBase64 = await Promise.all(
        values.images.map((f) =>
          f.originFileObj ? toBase64(f.originFileObj) : f.url,
        ),
      );

      const thumbnailBase64 = values.thumbnail[0].originFileObj
        ? await toBase64(values.thumbnail[0].originFileObj)
        : values.thumbnail[0].url;

      const categoryItem = categories.find(
        (item) => item.value === values.category,
      );

      const payload = {
        title: values.title,
        description: values.description,
        price: values.price,
        discountPercentage: values.discount || 0,
        stock: values.stock,
        category: categoryItem.slug,
        categoryId: categoryItem.value,
        brand: values.brand || "",
        tags,
        dimensions: values.dimensions || {},
        images: imagesBase64,
        thumbnail: thumbnailBase64,
      };

      if (isEdit) {
        await productServices.updateProduct(id, payload);
        message.success("Update product successfully");
      } else {
        await productServices.addProduct({
          ...payload,
          rating: 0,
          meta: { createdAt: new Date().toISOString() },
        });
        message.success("Add product successfully");
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
          {isEdit ? "Edit Product" : "Add New Product"}
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

          <Divider orientation="left">Dimensions</Divider>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Form.Item name={["dimensions", "width"]} label="Width">
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item name={["dimensions", "height"]} label="Height">
              <InputNumber className="w-full" />
            </Form.Item>
            <Form.Item name={["dimensions", "depth"]} label="Depth">
              <InputNumber className="w-full" />
            </Form.Item>
          </div>

          <Divider orientation="left">Tags</Divider>
          <Select
            mode="tags"
            style={{ width: "100%" }}
            value={tags}
            onChange={setTags}
          />

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
              {isEdit ? "Update Product" : "Add Product"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
