import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { authServices } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

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

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authServices.login(values);

      let token = null;
      let role = "USER";

      if (response?.access_token) {
        // json-server response
        token = response.token;
        role = response.user?.role || "USER";
      } else if (response?.success && response.data?.access_token) {
        // express BE response
        token = response.data.access_token;
        const payload = decodeJwt(token);
        role = payload?.role || "USER";
      } else {
        throw new Error("Invalid credentials");
      }

      login({
        email: values.email,
        token,
        role,
      });

      localStorage.setItem("access_token", token);

      message.success("Đăng nhập thành công");
      navigate(role === "ADMIN" ? "/admin" : "/");
    } catch (err) {
      console.error(err);
      message.error("Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <Title level={3} className="text-center mb-4">
          Đăng nhập
        </Title>

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
              Login
            </Button>
          </Form.Item>

          <div className="text-center">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
