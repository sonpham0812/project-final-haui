import { useEffect, useState, useRef } from "react";
import { Form, Input, Button, message, Spin, Divider, Avatar } from "antd";
import { CameraOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { userProfileServices, adminUploadServices } from "../../../api";
import useAuth from "../../../hooks/useAuth";
import "./index.scss";

export default function ProfilePage() {
  const { login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [infoForm] = Form.useForm();
  const [pwForm] = Form.useForm();

  const fetchProfile = async () => {
    try {
      const data = await userProfileServices.getMe();
      setProfile(data);
      infoForm.setFieldsValue({ name: data.name, email: data.email });
    } catch {
      message.error("Không thể tải thông tin hồ sơ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const res = await adminUploadServices.uploadAvatar(file);
      const updated = await userProfileServices.updateMe({ avatar: res.imageUrl });
      setProfile(updated);
      // Cập nhật user trong localStorage để sidebar hiển thị đúng
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      login({ ...stored, avatar: updated.avatar });
      message.success("Cập nhật ảnh đại diện thành công");
    } catch {
      message.error("Tải ảnh thất bại");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSaveInfo = async (values) => {
    setSaving(true);
    try {
      const updated = await userProfileServices.updateMe({ name: values.name });
      setProfile(updated);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      login({ ...stored, name: updated.name });
      message.success("Cập nhật thông tin thành công");
    } catch {
      message.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values) => {
    setChangingPw(true);
    try {
      await userProfileServices.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      message.success("Đổi mật khẩu thành công");
      pwForm.resetFields();
    } catch (err) {
      message.error(err?.message || "Đổi mật khẩu thất bại");
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) return <Spin size="large" className="profile-spin" />;

  return (
    <div className="profile-page">
      <div className="profile-page__header">
        <h2 className="profile-page__title">Hồ Sơ Của Tôi</h2>
        <p className="profile-page__subtitle">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      <Divider />

      <div className="profile-page__body">
        {/* LEFT: Forms */}
        <div className="profile-page__forms">
          {/* Info form */}
          <Form form={infoForm} layout="horizontal" labelCol={{ span: 6 }} onFinish={handleSaveInfo}>
            <Form.Item label="Tên đăng nhập">
              <Input value={profile?.email} disabled />
              <span className="profile-page__hint">Email không thể thay đổi</span>
            </Form.Item>

            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên" }]}
            >
              <Input placeholder="Nhập tên hiển thị" />
            </Form.Item>

            <Form.Item label=" " colon={false}>
              <Button type="primary" htmlType="submit" loading={saving} className="profile-page__save-btn">
                Lưu
              </Button>
            </Form.Item>
          </Form>

          <Divider orientation="left"><LockOutlined /> Đổi mật khẩu</Divider>

          {/* Password form */}
          <Form form={pwForm} layout="horizontal" labelCol={{ span: 6 }} onFinish={handleChangePassword}>
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
            >
              <Input.Password placeholder="Mật khẩu hiện tại" />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Tối thiểu 6 ký tự" },
              ]}
            >
              <Input.Password placeholder="Mật khẩu mới" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) return Promise.resolve();
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Xác nhận mật khẩu mới" />
            </Form.Item>

            <Form.Item label=" " colon={false}>
              <Button type="primary" htmlType="submit" loading={changingPw} className="profile-page__save-btn">
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* RIGHT: Avatar */}
        <div className="profile-page__avatar-col">
          <Spin spinning={avatarUploading}>
            <div className="profile-page__avatar-wrap">
              <Avatar
                size={100}
                src={profile?.avatar}
                icon={!profile?.avatar && <UserOutlined />}
                style={{ backgroundColor: "#ee4d2d", fontSize: 40 }}
              >
                {!profile?.avatar && profile?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </div>
          </Spin>
          <Button
            icon={<CameraOutlined />}
            className="profile-page__avatar-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            Chọn Ảnh
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          <p className="profile-page__avatar-hint">
            Dung lượng file tối đa 5 MB<br />Định dạng: JPEG, PNG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}

