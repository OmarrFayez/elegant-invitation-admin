import React from 'react';
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

  return (
    <div className={`rich-text-editor`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid #ccc;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            border-radius: 8px 8px 0 0;
            direction: ltr !important;
          }
          .rich-text-editor .ql-container {
            border-bottom: 1px solid #ccc;
            border-left: 1px solid #ccc;
            border-right: 1px solid #ccc;
            border-radius: 0 0 8px 8px;
            min-height: 200px;
          }
          .rich-text-editor .ql-editor {
            min-height: 180px;
            ${isArabic ? 'direction: rtl; text-align: right;' : 'direction: ltr; text-align: left;'}
          }
          
          /* Keep toolbar always LTR */
          .rich-text-editor .ql-toolbar .ql-formats {
            margin-left: 0;
            margin-right: 12px;
            float: left;
          }
          .rich-text-editor .ql-toolbar .ql-picker {
            float: none;
          }
          .rich-text-editor .ql-picker-options {
            direction: ltr;
          }
          
          /* Font families */
          .ql-font-sans-serif { font-family: 'Arial', sans-serif; }
          .ql-font-serif { font-family: 'Georgia', serif; }
          .ql-font-monospace { font-family: 'Monaco', monospace; }
          .ql-font-arabic-naskh { font-family: 'Amiri', 'Traditional Arabic', serif; }
          .ql-font-arabic-kufi { font-family: 'Aref Ruqaa', 'Arabic Typesetting', serif; }
        `
      }} />
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          backgroundColor: 'white',
          minHeight: '200px'
        }}
      />
    </div>
  );
};

export default RichTextEditor;