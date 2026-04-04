import {
  FacebookFilled,
  InstagramFilled,
  YoutubeFilled,
  MailFilled,
} from "@ant-design/icons";
import "./index.scss";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <div className="footer bg-main padding-l">
      <div className="footer-container">
        {/* Column 1 */}
        <div className="footer-col">
          <h3>Chăm sóc khách hàng</h3>
          <Link to="/">Trung tâm hỗ trợ</Link>
          <Link to="/">Hướng dẫn mua hàng</Link>
          <Link to="/">Chính sách bảo hành</Link>
        </div>

        {/* Column 2 */}
        <div className="footer-col">
          <h3>Về chúng tôi</h3>
          <Link to="/">Giới thiệu</Link>
          <Link to="/">Tuyển dụng</Link>
          <Link to="/">Điều khoản dịch vụ</Link>
        </div>

        {/* Column 3 */}
        <div className="footer-col">
          <h3>Theo dõi chúng tôi</h3>
          <a href="/">
            <FacebookFilled /> Facebook
          </a>
          <a href="/">
            <InstagramFilled /> Instagram
          </a>
          <a href="/">
            <YoutubeFilled /> Youtube
          </a>
        </div>

        {/* Column 4 */}
        <div className="footer-col">
          <h3>Liên hệ</h3>
          <a href="mailto:support@yourshop.com">
            <MailFilled /> support@yourshop.com
          </a>
          <span>Hotline: 1900 1234</span>
          <span>Địa chỉ: Hà Nội – Việt Nam</span>
        </div>
      </div>

      <div className="footer-bottom">© 2025 YourShop. All rights reserved.</div>
    </div>
  );
}
