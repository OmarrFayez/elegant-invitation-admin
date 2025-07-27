import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

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
  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className="rich-text-editor">
      <Editor
        apiKey="no-api-key" // Using TinyMCE without API key for basic functionality
        value={value}
        onEditorChange={handleEditorChange}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | fontfamily fontsize | ' +
            'bold italic underline strikethrough | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | forecolor backcolor | help',
          font_family_formats: 
            'Arial=arial,helvetica,sans-serif; ' +
            'Georgia=georgia,serif; ' +
            'Times New Roman=times new roman,times,serif; ' +
            'Verdana=verdana,geneva,sans-serif; ' +
            'Trebuchet MS=trebuchet ms,geneva,sans-serif; ' +
            'Comic Sans MS=comic sans ms,cursive; ' +
            'Impact=impact,chicago,sans-serif; ' +
            'Helvetica=helvetica,arial,sans-serif; ' +
            'Calibri=calibri,geneva,sans-serif; ' +
            'Tahoma=tahoma,arial,helvetica,sans-serif; ' +
            'Lucida Grande=lucida grande,helvetica,arial,sans-serif; ' +
            'Open Sans=open sans,helvetica,arial,sans-serif; ' +
            'Roboto=roboto,helvetica,arial,sans-serif; ' +
            'Lato=lato,helvetica,arial,sans-serif; ' +
            'Montserrat=montserrat,helvetica,arial,sans-serif; ' +
            'Poppins=poppins,helvetica,arial,sans-serif; ' +
            'Nunito=nunito,helvetica,arial,sans-serif; ' +
            'Source Sans Pro=source sans pro,helvetica,arial,sans-serif; ' +
            'Ubuntu=ubuntu,helvetica,arial,sans-serif; ' +
            'Raleway=raleway,helvetica,arial,sans-serif; ' +
            'Merriweather=merriweather,georgia,serif; ' +
            'Oswald=oswald,helvetica,arial,sans-serif; ' +
            'PT Sans=pt sans,helvetica,arial,sans-serif; ' +
            'Crimson Text=crimson text,georgia,serif; ' +
            'EB Garamond=eb garamond,georgia,serif; ' +
            'Libre Baskerville=libre baskerville,georgia,serif; ' +
            'Dancing Script=dancing script,cursive; ' +
            'Playfair Display=playfair display,georgia,serif',
          font_size_formats: '8pt 10pt 12pt 14pt 16pt 18pt 24pt 36pt 48pt',
          content_style: 'body { font-family:Arial,Helvetica,sans-serif; font-size:14px }',
          placeholder: placeholder,
          branding: false,
          statusbar: false,
          resize: false,
          style_formats_merge: true,
        }}
      />
    </div>
  );
};

export default RichTextEditor;