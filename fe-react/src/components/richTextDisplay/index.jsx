import DOMPurify from "dompurify";
import "react-quill-new/dist/quill.snow.css";

export default function RichTextDisplay({ html }) {
  if (!html) return null;

  const clean = DOMPurify.sanitize(html);

  return (
    <div
      className="ql-editor rich-text-display"
      dangerouslySetInnerHTML={{ __html: clean }}
      style={{ padding: 0 }}
    />
  );
}
