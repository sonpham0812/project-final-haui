import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { AuthContext } from "../../context/AuthContext";
import { publicAuthServices } from "../../api";
import { useLocation } from "react-router-dom";

const { Title } = Typography;

const decodeJwt = (token) => {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch {
    return null;
  }
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ NEW

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await publicAuthServices.login(values);
      console.log("Login response:", response);

      let token = null;
      let userData = null;

      if (response.access_token) {
        // Backend response format mới
        token = response.access_token;
        userData = decodeJwt(token);
      } else {
        throw new Error("Invalid credentials");
      }

      if (!userData || !userData.role) {
        throw new Error("Invalid token data");
      }

      login({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        token,
      });

      localStorage.setItem("access_token", token);

      message.success("Đăng nhập thành công");

      // Chuyển hướng dựa trên role
      const redirectPath = location.state?.from;

      if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate(redirectPath || "/home");
      }
    } catch (err) {
      console.error(err);
      message.error("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex align-center justify-center">
      <Card className="w-full">
        <Title level={3}>Đăng nhập</Title>

        <Form layout="vertical" onFinish={onFinish}>
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
              Đăng Nhập
            </Button>
          </Form.Item>

          <div className="text-center">
            <span>Chưa có tài khoản? </span>
            <Button color="primary" variant="link" href="/register">
              Đăng ký
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
