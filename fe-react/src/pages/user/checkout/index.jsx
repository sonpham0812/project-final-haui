import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, Select, message, Divider, Tag } from "antd";
import { userOrderServices } from "../../../api";
import { useCart } from "../../../context/CartContext";
import "./index.scss";

const { Option } = Select;
const { TextArea } = Input;

// ─── Địa chỉ fake ────────────────────────────────────────────────
const PROVINCES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Hải Phòng",
  "Huế",
  "Nha Trang",
  "Vũng Tàu",
];

const DISTRICTS = {
  "Hồ Chí Minh": [
    "Quận 1",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 7",
    "Quận 10",
    "Quận 12",
    "Bình Thạnh",
    "Gò Vấp",
    "Tân Bình",
    "Thủ Đức",
  ],
  "Hà Nội": [
    "Ba Đình",
    "Hoàn Kiếm",
    "Đống Đa",
    "Hai Bà Trưng",
    "Cầu Giấy",
    "Thanh Xuân",
    "Hoàng Mai",
    "Long Biên",
    "Nam Từ Liêm",
  ],
  "Đà Nẵng": [
    "Hải Châu",
    "Thanh Khê",
    "Sơn Trà",
    "Ngũ Hành Sơn",
    "Liên Chiểu",
    "Cẩm Lệ",
    "Hòa Vang",
  ],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt"],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Bến Cát", "Tân Uyên"],
  "Đồng Nai": [
    "Biên Hòa",
    "Long Khánh",
    "Trảng Bom",
    "Nhơn Trạch",
    "Long Thành",
  ],
  "Hải Phòng": [
    "Hồng Bàng",
    "Ngô Quyền",
    "Lê Chân",
    "Hải An",
    "Kiến An",
    "Đồ Sơn",
  ],
  Huế: ["Phú Xuân", "Thuận Hóa", "Hương Thủy", "Hương Trà"],
  "Nha Trang": ["Vĩnh Hải", "Phước Long", "Vĩnh Nguyên", "Phước Hải"],
  "Vũng Tàu": ["Vũng Tàu", "Bà Rịa", "Phú Mỹ", "Long Điền", "Đất Đỏ"],
};

// ─── Tính phí ship (mirror logic BE) ─────────────────────────────
const calcShipping = (subtotal) => (subtotal < 500000 ? 20000 : 0);

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n,
  );

// ─────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { refreshCart } = useCart();
  const [items, setItems] = useState([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [province, setProvince] = useState(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Load items from localStorage
  useEffect(() => {
    const raw = localStorage.getItem("checkout_items");
    if (!raw) {
      navigate("/cart");
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        navigate("/cart");
        return;
      }
      setItems(parsed);
      setIsBuyNow(localStorage.getItem("checkout_source") === "buy_now");
    } catch {
      navigate("/cart");
    }
  }, [navigate]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingFee = calcShipping(subtotal);
  const total = subtotal + shippingFee;

  const handleProvinceChange = (val) => {
    setProvince(val);
    form.setFieldValue("district", undefined);
  };

  const handleSubmit = async (values) => {
    const { phone, province: prov, district, addressDetail, fullName } = values;
    const fullAddress = `${addressDetail}, ${district}, ${prov}`;
    const payload = isBuyNow
      ? {
          buyNowItems: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }
      : { selectedItemIds: items.map((i) => i.product_id) };

    try {
      setSubmitting(true);
      await userOrderServices.createOrder({
        address: fullAddress,
        name: fullName,
        phone,
        ...payload,
      });
      message.success("Đặt hàng thành công! 🎉");
      localStorage.removeItem("checkout_items");
      localStorage.removeItem("checkout_source");
      if (!isBuyNow) await refreshCart();
      navigate("/orders?tab=PENDING");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="checkout-page">
      <h2>Xác nhận đơn hàng</h2>

      {/* ── Danh sách sản phẩm ── */}
      <div className="checkout-products">
        <h3>Sản phẩm đã chọn</h3>
        <Divider />
        {items.map((item) => (
          <div key={item.id} className="product-item">
            <img
              src={item.thumbnail_image}
              alt={item.name}
              className="product-image"
            />
            <div className="product-info">
              <p className="product-name">{item.name}</p>
              <p className="product-meta">
                Đơn giá: <span className="unit-price">{fmt(item.price)}</span>
              </p>
              <p className="product-meta">
                Số lượng: <Tag color="blue">{item.quantity}</Tag>
              </p>
            </div>
            <div className="product-total">
              {fmt(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-grid">
        {/* ── Form địa chỉ & người nhận ── */}
        <div className="checkout-panel">
          <h3>Thông tin giao hàng</h3>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
            >
              <Input placeholder="Nguyễn Văn A" size="large" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^\d{9,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="0901234567" size="large" />
            </Form.Item>

            <Form.Item
              label="Tỉnh / Thành phố"
              name="province"
              rules={[
                { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
              ]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                size="large"
                onChange={handleProvinceChange}
              >
                {PROVINCES.map((p) => (
                  <Option key={p} value={p}>
                    {p}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quận / Huyện"
              name="district"
              rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
            >
              <Select
                placeholder="Chọn quận/huyện"
                size="large"
                disabled={!province}
              >
                {(DISTRICTS[province] || []).map((d) => (
                  <Option key={d} value={d}>
                    {d}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Địa chỉ cụ thể"
              name="addressDetail"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ cụ thể" },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Số nhà, tên đường..."
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
              className="btn-order"
            >
              🛒 Đặt hàng
            </Button>
          </Form>
        </div>

        {/* ── Tóm tắt đơn hàng ── */}
        <div className="checkout-panel summary-panel">
          <h3>Tóm tắt đơn hàng</h3>
          <Divider />

          <div className="summary-row">
            <span>Tổng tiền hàng ({items.length} sản phẩm)</span>
            <span>{fmt(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Phí vận chuyển</span>
            {shippingFee === 0 ? (
              <span className="free-ship">Miễn phí</span>
            ) : (
              <span>{fmt(shippingFee)}</span>
            )}
          </div>
          {shippingFee > 0 && (
            <p className="summary-note">
              * Miễn phí ship cho đơn từ {fmt(500000)}
            </p>
          )}

          <Divider />

          <div className="summary-total">
            <span className="total-label">Tổng thanh toán</span>
            <span className="total-amount">{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
