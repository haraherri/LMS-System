import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ input, setInput }) => {
  const handleChange = (content) => {
    setInput({ ...input, description: content });
  };

  const fonts = [
    { label: "Roboto", value: "roboto", family: "'Roboto', sans-serif" },
    {
      label: "Playfair",
      value: "playfair",
      family: "'Playfair Display', serif",
    },
    { label: "Pacifico", value: "pacifico", family: "'Pacifico', cursive" },
    {
      label: "Merriweather",
      value: "merriweather",
      family: "'Merriweather', serif",
    },
    {
      label: "Source Code",
      value: "sourcecode",
      family: "'Source Code Pro', monospace",
    },
  ];

  const Size = ReactQuill.Quill.import("attributors/style/size");
  Size.whitelist = [
    "8px",
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "32px",
    "48px",
  ];
  ReactQuill.Quill.register(Size, true);

  useEffect(() => {
    const Font = ReactQuill.Quill.import("formats/font");
    Font.whitelist = fonts.map((font) => font.value);
    ReactQuill.Quill.register(Font, true);
  }, []);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ font: fonts.map((font) => font.value) }],
        [{ size: Size.whitelist }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["blockquote", "code-block"],
        ["link", "image", "video"],
        ["clean"],
      ],
    },
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Playfair+Display:wght@400;700&family=Pacifico&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap');
    
    ${fonts
      .map(
        (font) => `
      .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="${font.value}"]::before,
      .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="${font.value}"]::before {
        content: '${font.label}';
        font-family: ${font.family};
      }
      
      .ql-font-${font.value} {
        font-family: ${font.family};
      }
    `
      )
      .join("")}

    /* CSS cho size picker */
    .ql-snow .ql-picker.ql-size .ql-picker-label[data-value]::before,
    .ql-snow .ql-picker.ql-size .ql-picker-item[data-value]::before {
      content: attr(data-value);
    }
    
    /* Áp dụng size cho nội dung */
    ${Size.whitelist
      .map(
        (size) => `
      .ql-size-${size} {
        font-size: ${size};
      }
    `
      )
      .join("")}
  `;

  return (
    <>
      <style>{styles}</style>
      <ReactQuill
        theme="snow"
        value={input.description}
        onChange={handleChange}
        modules={modules}
      />
    </>
  );
};

export default RichTextEditor;
