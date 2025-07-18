import { useDrag } from "react-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Type, Image, Square, Database } from "lucide-react";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";

interface ComponentLibraryProps {
  onAddElement: (element: Omit<DesignElement, 'id'>) => void;
}

interface DraggableComponentProps {
  type: string;
  icon: React.ReactNode;
  label: string;
  componentType: DesignElement['type'];
  defaultWidth?: number;
  defaultHeight?: number;
  defaultContent?: string;
  fieldType?: DesignElement['fieldType'];
  defaultStyles?: DesignElement['styles'];
  onAddElement: (element: Omit<DesignElement, 'id'>) => void;
}

function DraggableComponent({
  type,
  icon,
  label,
  componentType,
  defaultWidth = 200,
  defaultHeight = 40,
  defaultContent,
  fieldType,
  defaultStyles = {},
  onAddElement,
}: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: {
      type: 'component',
      componentType,
      defaultWidth,
      defaultHeight,
      defaultContent,
      fieldType,
      defaultStyles,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = () => {
    onAddElement({
      type: componentType,
      x: 50,
      y: 50,
      width: defaultWidth,
      height: defaultHeight,
      content: defaultContent,
      fieldType,
      styles: defaultStyles,
    });
  };

  return (
    <div
      ref={drag}
      className={`
        flex items-center gap-3 p-3 border rounded-lg cursor-move hover:bg-accent hover:text-accent-foreground transition-colors
        ${isDragging ? 'opacity-50' : ''}
      `}
      onClick={handleClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export function ComponentLibrary({ onAddElement }: ComponentLibraryProps) {
  const basicComponents = [
    {
      type: 'text',
      icon: <Type className="w-4 h-4" />,
      label: 'Text',
      componentType: 'text' as const,
      defaultContent: 'Your text here',
      defaultStyles: { fontSize: 16, color: '#000000' },
    },
    {
      type: 'image',
      icon: <Image className="w-4 h-4" />,
      label: 'Image',
      componentType: 'image' as const,
      defaultWidth: 150,
      defaultHeight: 150,
    },
    {
      type: 'container',
      icon: <Square className="w-4 h-4" />,
      label: 'Container',
      componentType: 'container' as const,
      defaultWidth: 300,
      defaultHeight: 200,
      defaultStyles: { backgroundColor: '#f9fafb', borderRadius: 8 },
    },
  ];

  const dataFields = [
    {
      type: 'bride_name',
      label: 'Bride Name',
      fieldType: 'bride_name' as const,
      defaultStyles: { fontSize: 24, fontWeight: 'bold' as const, color: '#dc2626' },
    },
    {
      type: 'groom_name',
      label: 'Groom Name',
      fieldType: 'groom_name' as const,
      defaultStyles: { fontSize: 24, fontWeight: 'bold' as const, color: '#2563eb' },
    },
    {
      type: 'wedding_date',
      label: 'Wedding Date',
      fieldType: 'wedding_date' as const,
      defaultStyles: { fontSize: 18, fontStyle: 'italic' as const },
    },
    {
      type: 'location_text',
      label: 'Location',
      fieldType: 'location_text' as const,
      defaultStyles: { fontSize: 16 },
    },
    {
      type: 'description1',
      label: 'Description 1',
      fieldType: 'description1' as const,
      defaultWidth: 300,
      defaultHeight: 60,
      defaultStyles: { fontSize: 14, textAlign: 'center' as const },
    },
    {
      type: 'description2',
      label: 'Description 2',
      fieldType: 'description2' as const,
      defaultWidth: 300,
      defaultHeight: 60,
      defaultStyles: { fontSize: 14, textAlign: 'center' as const },
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            Basic Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {basicComponents.map((component) => (
            <DraggableComponent
              key={component.type}
              {...component}
              onAddElement={onAddElement}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Wedding Data Fields
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {dataFields.map((field) => (
            <DraggableComponent
              key={field.type}
              type={field.type}
              icon={<Database className="w-4 h-4" />}
              label={field.label}
              componentType="field"
              fieldType={field.fieldType}
              defaultStyles={field.defaultStyles}
              defaultWidth={field.defaultWidth}
              defaultHeight={field.defaultHeight}
              onAddElement={onAddElement}
            />
          ))}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground p-2">
        <p><strong>Tip:</strong> Drag components to the canvas or click to add them at default position.</p>
      </div>
    </div>
  );
}