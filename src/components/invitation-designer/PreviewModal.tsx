import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";

interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elements: DesignElement[];
  canvasSize: { width: number; height: number };
  designName: string;
}

export function PreviewModal({
  open,
  onOpenChange,
  elements,
  canvasSize,
  designName,
}: PreviewModalProps) {
  const getFieldContent = (fieldType: string) => {
    const fieldMap: Record<string, string> = {
      bride_name: 'Sarah',
      groom_name: 'John',
      wedding_date: 'June 15, 2024',
      location_text: '123 Wedding Venue, City',
      description1: 'Join us for our special day',
      description2: 'Reception to follow',
    };
    return fieldMap[fieldType] || fieldType;
  };

  const renderElement = (element: DesignElement) => {
    const elementStyles: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      fontSize: element.styles.fontSize || 16,
      fontFamily: element.styles.fontFamily || 'Inter',
      color: element.styles.color || '#000000',
      backgroundColor: element.styles.backgroundColor || 'transparent',
      borderRadius: element.styles.borderRadius || 0,
      padding: element.styles.padding || 8,
      textAlign: element.styles.textAlign || 'left',
      fontWeight: element.styles.fontWeight || 'normal',
      fontStyle: element.styles.fontStyle || 'normal',
      display: 'flex',
      alignItems: element.type === 'container' ? 'stretch' : 'center',
      justifyContent: element.styles.textAlign === 'center' ? 'center' : 
                     element.styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
      border: element.type === 'container' ? '1px solid #e5e7eb' : 'none',
      overflow: 'hidden',
    };

    const content = element.type === 'field' && element.fieldType
      ? getFieldContent(element.fieldType)
      : element.content || 'Empty Element';

    return (
      <div
        key={element.id}
        style={elementStyles}
        className="select-none"
      >
        {element.type === 'image' ? (
          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
            <span>Image</span>
          </div>
        ) : (
          <span className="break-words">{content}</span>
        )}
      </div>
    );
  };

  const exportAsImage = () => {
    // TODO: Implement HTML to canvas conversion for image export
    console.log('Export as image functionality would go here');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Preview: {designName}</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportAsImage}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-center p-4">
          <div
            className="relative bg-white shadow-lg border"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            {elements.map(renderElement)}
            
            {elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p>No elements to preview</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}