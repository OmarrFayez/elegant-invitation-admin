import { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { DraggableElement } from "./DraggableElement";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";

interface DesignCanvasProps {
  elements: DesignElement[];
  selectedElement: string | null;
  canvasSize: { width: number; height: number };
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onDeleteElement: (id: string) => void;
}

export function DesignCanvas({
  elements,
  selectedElement,
  canvasSize,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
}: DesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const [, drop] = useDrop(() => ({
    accept: ['component', 'element'],
    drop: (item: any, monitor) => {
      const offset = monitor.getDropResult();
      if (!offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const clientOffset = monitor.getClientOffset();
        
        if (clientOffset) {
          const x = clientOffset.x - canvasRect.left - (dragOffset?.x || 0);
          const y = clientOffset.y - canvasRect.top - (dragOffset?.y || 0);
          
          if (item.type === 'component') {
            // Handle new component drop
            const newElement: Omit<DesignElement, 'id'> = {
              type: item.componentType,
              x: Math.max(0, x),
              y: Math.max(0, y),
              width: item.defaultWidth || 200,
              height: item.defaultHeight || 40,
              content: item.defaultContent,
              fieldType: item.fieldType,
              styles: item.defaultStyles || {},
            };
            
            // This would be handled by parent component
            console.log('New element to add:', newElement);
          } else if (item.type === 'element') {
            // Handle existing element move
            onUpdateElement(item.id, {
              x: Math.max(0, Math.min(x, canvasSize.width - item.width)),
              y: Math.max(0, Math.min(y, canvasSize.height - item.height)),
            });
          }
        }
      }
      setDragOffset(null);
    },
  }));

  const handleElementClick = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectElement(id);
  };

  const handleCanvasClick = () => {
    onSelectElement(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Delete' && selectedElement) {
      onDeleteElement(selectedElement);
    }
  };

  drop(canvasRef);

  return (
    <div className="p-8 h-full">
      <div className="mx-auto" style={{ width: canvasSize.width + 40 }}>
        <div
          ref={canvasRef}
          className="relative bg-white shadow-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
          onClick={handleCanvasClick}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {elements.map((element) => (
            <DraggableElement
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              onClick={(e) => handleElementClick(element.id, e)}
              onUpdateElement={onUpdateElement}
              canvasSize={canvasSize}
              onDragStart={(offset) => setDragOffset(offset)}
            />
          ))}
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg font-medium">Drop components here</p>
                <p className="text-sm">Drag elements from the left sidebar to start designing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}