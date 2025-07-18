import { useRef, useState } from "react";
import { useDrag } from "react-dnd";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";
import { cn } from "@/lib/utils";

interface DraggableElementProps {
  element: DesignElement;
  isSelected: boolean;
  onClick: (event: React.MouseEvent) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  canvasSize: { width: number; height: number };
  onDragStart: (offset: { x: number; y: number }) => void;
}

export function DraggableElement({
  element,
  isSelected,
  onClick,
  onUpdateElement,
  canvasSize,
  onDragStart,
}: DraggableElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'element',
    item: () => {
      const rect = ref.current?.getBoundingClientRect();
      if (rect) {
        onDragStart({ x: 0, y: 0 });
      }
      return { 
        type: 'element', 
        id: element.id, 
        width: element.width, 
        height: element.height 
      };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

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

  const renderContent = () => {
    if (element.type === 'field' && element.fieldType) {
      return getFieldContent(element.fieldType);
    }
    return element.content || 'Empty Element';
  };

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startLeft = element.x;
    const startTop = element.y;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      switch (handle) {
        case 'se': // bottom-right
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          break;
        case 'sw': // bottom-left
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight + deltaY);
          newX = Math.max(0, startLeft + deltaX);
          break;
        case 'ne': // top-right
          newWidth = Math.max(20, startWidth + deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newY = Math.max(0, startTop + deltaY);
          break;
        case 'nw': // top-left
          newWidth = Math.max(20, startWidth - deltaX);
          newHeight = Math.max(20, startHeight - deltaY);
          newX = Math.max(0, startLeft + deltaX);
          newY = Math.max(0, startTop + deltaY);
          break;
      }

      // Ensure element stays within canvas bounds
      if (newX + newWidth > canvasSize.width) {
        newWidth = canvasSize.width - newX;
      }
      if (newY + newHeight > canvasSize.height) {
        newHeight = canvasSize.height - newY;
      }

      onUpdateElement(element.id, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  drag(ref);

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
    opacity: isDragging ? 0.5 : 1,
    cursor: isResizing ? 'nw-resize' : 'move',
  };

  return (
    <div
      ref={ref}
      style={elementStyles}
      className={cn(
        "select-none overflow-hidden",
        isSelected && "ring-2 ring-blue-500 ring-offset-2",
        element.type === 'image' && "bg-gray-100"
      )}
      onClick={onClick}
    >
      {element.type === 'image' ? (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span>Image</span>
        </div>
      ) : (
        <span className="break-words">{renderContent()}</span>
      )}
      
      {/* Resize handles */}
      {isSelected && (
        <>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-se-resize"
            onMouseDown={(e) => handleMouseDown(e, 'se')}
          />
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-sw-resize"
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
          />
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border border-white cursor-ne-resize"
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
          />
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white cursor-nw-resize"
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
          />
        </>
      )}
    </div>
  );
}