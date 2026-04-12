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

      if (!response || !response.id) {
        throw new Error("Đăng ký thất bại");
      }

      message.success("Đăng ký thành công. Vui lòng đăng nhập!");

      // User mới luôn có role USER
      login({
        id: response.id,
        email: values.email,
        role: response.role || "USER",
      });

      navigate("/");
    } catch (err) {
      console.error(err);
      message.error(err?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex align-center justify-center">
      <Card className="w-full">
        <Title level={3}>Đăng ký</Title>

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
            <span>Đã có tài khoản? </span>
            <Button color="primary" variant="link" href="/login">
              Đăng nhập
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
