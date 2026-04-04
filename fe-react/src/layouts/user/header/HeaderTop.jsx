import { Flex } from "antd";
import { Link } from "react-router-dom";
import {
  FacebookFilled,
  InstagramFilled,
  QuestionCircleFilled,
} from "@ant-design/icons";

export default function HeaderTop() {
  return (
    <Flex
      justify="space-between"
      align="center"
      style={{ padding: "10px 20px" }}
    >
      <Flex gap="middle">
        <Link to="/">Seller Center</Link>
        <Link to="/">Download</Link>
        <Flex gap="4px" align="center">
          <Link to="/">Follow us on</Link>
          <a href="/">
            <FacebookFilled />
          </a>
          <a href="/">
            <InstagramFilled />
          </a>
        </Flex>
      </Flex>

      <Flex gap="middle">
        <Flex gap="4px" align="center">
          <a href="/">
            <QuestionCircleFilled />
          </a>
          <Link to="/">Support</Link>
        </Flex>
        <Link to="/">Register</Link>
        <Link to="/">Login</Link>
      </Flex>
    </Flex>
  );
}
