import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { publicAuthServices } from "../../api";

const { Title } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await publicAuthServices.register(values);

      if (!response || !response.success) {
        throw new Error(response?.message || "Không thể đăng ký");
      }

      message.success("Đăng ký thành công. Vui lòng đăng nhập!");

      // Nếu server trả dữ liệu user (với role), có thể login tự động.
      const userData = response.data || {};
      if (userData?.id) {
        login({
          email: values.email,
          role: userData.role || "USER",
        });
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <Title level={3} className="text-center mb-4">
          Đăng ký
        </Title>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="name"
            label="Họ tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input placeholder="Họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>

          <div className="text-center">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
