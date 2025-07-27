import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter description..."
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': ['serif', 'monospace', 'Dancing Script', 'Playfair Display', 'Arial', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Helvetica', 'Calibri', 'Tahoma', 'Lucida Grande', 'Open Sans', 'Roboto', 'Lato', 'Montserrat', 'Poppins', 'Nunito', 'Source Sans Pro', 'Ubuntu', 'Raleway', 'Merriweather', 'Oswald', 'PT Sans', 'Crimson Text', 'EB Garamond', 'Libre Baskerville'] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
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
    'indent', 'align',
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
      }
      .ql-container {
        border-bottom: 1px solid #ccc;
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        border-radius: 0 0 8px 8px;
        min-height: 200px;
      }
      .ql-editor {
        min-height: 180px;
      }
      .ql-font-serif { font-family: 'Georgia', serif; }
      .ql-font-monospace { font-family: 'Monaco', monospace; }
      .ql-font-dancing-script { font-family: 'Dancing Script', cursive; }
      .ql-font-playfair-display { font-family: 'Playfair Display', serif; }
      .ql-font-arial { font-family: 'Arial', sans-serif; }
      .ql-font-georgia { font-family: 'Georgia', serif; }
      .ql-font-times-new-roman { font-family: 'Times New Roman', serif; }
      .ql-font-verdana { font-family: 'Verdana', sans-serif; }
      .ql-font-trebuchet-ms { font-family: 'Trebuchet MS', sans-serif; }
      .ql-font-impact { font-family: 'Impact', sans-serif; }
      .ql-font-comic-sans-ms { font-family: 'Comic Sans MS', cursive; }
      .ql-font-helvetica { font-family: 'Helvetica', sans-serif; }
      .ql-font-calibri { font-family: 'Calibri', sans-serif; }
      .ql-font-tahoma { font-family: 'Tahoma', sans-serif; }
      .ql-font-lucida-grande { font-family: 'Lucida Grande', sans-serif; }
      .ql-font-open-sans { font-family: 'Open Sans', sans-serif; }
      .ql-font-roboto { font-family: 'Roboto', sans-serif; }
      .ql-font-lato { font-family: 'Lato', sans-serif; }
      .ql-font-montserrat { font-family: 'Montserrat', sans-serif; }
      .ql-font-poppins { font-family: 'Poppins', sans-serif; }
      .ql-font-nunito { font-family: 'Nunito', sans-serif; }
      .ql-font-source-sans-pro { font-family: 'Source Sans Pro', sans-serif; }
      .ql-font-ubuntu { font-family: 'Ubuntu', sans-serif; }
      .ql-font-raleway { font-family: 'Raleway', sans-serif; }
      .ql-font-merriweather { font-family: 'Merriweather', serif; }
      .ql-font-oswald { font-family: 'Oswald', sans-serif; }
      .ql-font-pt-sans { font-family: 'PT Sans', sans-serif; }
      .ql-font-crimson-text { font-family: 'Crimson Text', serif; }
      .ql-font-eb-garamond { font-family: 'EB Garamond', serif; }
      .ql-font-libre-baskerville { font-family: 'Libre Baskerville', serif; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="rich-text-editor">
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
          minHeight: '200px'
        }}
      />
    </div>
  );
};

export default RichTextEditor;