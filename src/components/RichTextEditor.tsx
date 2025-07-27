import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isArabic?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description...",
  isArabic = false
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': ['sans-serif', 'serif', 'monospace', 'arabic-naskh', 'arabic-kufi'] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['link', 'image'],
      ['clean'],
      ['code-block']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet',
    'indent', 'align', 'direction',
    'link', 'image',
    'code-block'
  ];

  useEffect(() => {
    // Add custom styles for Quill editor
    const style = document.createElement('style');
    style.textContent = `
      .ql-toolbar {
        border-top: 1px solid #ccc;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-radius: 8px 8px 0 0;
        ${isArabic ? 'direction: rtl;' : ''}
      }
      .ql-container {
        border-bottom: 1px solid #ccc;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-radius: 0 0 8px 8px;
        min-height: 200px;
        ${isArabic ? 'direction: rtl;' : ''}
      }
      .ql-editor {
        min-height: 180px;
        ${isArabic ? 'direction: rtl; text-align: right;' : ''}
      }
      ${isArabic ? `
      .ql-toolbar .ql-formats {
        float: right !important;
      }
      .ql-toolbar .ql-formats:first-child {
        margin-right: 0;
        margin-left: 12px;
      }
      .ql-picker-options {
        direction: rtl;
      }
      ` : ''}
      .ql-font-sans-serif { font-family: 'Arial', sans-serif; }
      .ql-font-serif { font-family: 'Georgia', serif; }
      .ql-font-monospace { font-family: 'Monaco', monospace; }
      .ql-font-arabic-naskh { font-family: 'Amiri', 'Traditional Arabic', serif; }
      .ql-font-arabic-kufi { font-family: 'Aref Ruqaa', 'Arabic Typesetting', serif; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [isArabic]);

  return (
    <div className={`rich-text-editor ${isArabic ? 'rtl' : ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          backgroundColor: 'white',
          minHeight: '200px',
          direction: isArabic ? 'rtl' : 'ltr',
          textAlign: isArabic ? 'right' : 'left'
        }}
      />
    </div>
  );
};

export default RichTextEditor;