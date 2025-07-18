import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Trash2, Settings } from "lucide-react";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
}

export function PropertiesPanel({ selectedElement, onUpdateElement }: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="p-4 h-full flex items-center justify-center text-center">
        <div className="text-muted-foreground">
          <Settings className="w-8 h-8 mx-auto mb-2" />
          <p>Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  const updateStyle = (property: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      styles: {
        ...selectedElement.styles,
        [property]: value,
      },
    });
  };

  const updateProperty = (property: string, value: any) => {
    onUpdateElement(selectedElement.id, {
      [property]: value,
    });
  };

  return (
    <div className="p-4 space-y-4 h-full overflow-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Element Properties</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Position */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x-pos" className="text-xs">X Position</Label>
              <Input
                id="x-pos"
                type="number"
                value={selectedElement.x}
                onChange={(e) => updateProperty('x', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="y-pos" className="text-xs">Y Position</Label>
              <Input
                id="y-pos"
                type="number"
                value={selectedElement.y}
                onChange={(e) => updateProperty('y', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="width" className="text-xs">Width</Label>
              <Input
                id="width"
                type="number"
                value={selectedElement.width}
                onChange={(e) => updateProperty('width', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="height" className="text-xs">Height</Label>
              <Input
                id="height"
                type="number"
                value={selectedElement.height}
                onChange={(e) => updateProperty('height', Number(e.target.value))}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Content */}
          {(selectedElement.type === 'text' || selectedElement.type === 'container') && (
            <div>
              <Label htmlFor="content" className="text-xs">Content</Label>
              <Input
                id="content"
                value={selectedElement.content || ''}
                onChange={(e) => updateProperty('content', e.target.value)}
                className="h-8 text-xs"
                placeholder="Enter text content"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Styling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Typography */}
          {selectedElement.type !== 'image' && (
            <>
              <div>
                <Label className="text-xs">Font Size</Label>
                <div className="px-2">
                  <Slider
                    value={[selectedElement.styles.fontSize || 16]}
                    onValueChange={(value) => updateStyle('fontSize', value[0])}
                    max={72}
                    min={8}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  {selectedElement.styles.fontSize || 16}px
                </div>
              </div>

              <div>
                <Label className="text-xs">Font Family</Label>
                <Select
                  value={selectedElement.styles.fontFamily || 'Inter'}
                  onValueChange={(value) => updateStyle('fontFamily', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Font Weight</Label>
                  <Select
                    value={selectedElement.styles.fontWeight || 'normal'}
                    onValueChange={(value) => updateStyle('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Font Style</Label>
                  <Select
                    value={selectedElement.styles.fontStyle || 'normal'}
                    onValueChange={(value) => updateStyle('fontStyle', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="italic">Italic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Text Align</Label>
                <Select
                  value={selectedElement.styles.textAlign || 'left'}
                  onValueChange={(value) => updateStyle('textAlign', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="text-color" className="text-xs">Text Color</Label>
                <Input
                  id="text-color"
                  type="color"
                  value={selectedElement.styles.color || '#000000'}
                  onChange={(e) => updateStyle('color', e.target.value)}
                  className="h-8 w-full"
                />
              </div>
            </>
          )}

          {/* Background and Border */}
          <Separator />
          
          <div>
            <Label htmlFor="bg-color" className="text-xs">Background Color</Label>
            <Input
              id="bg-color"
              type="color"
              value={selectedElement.styles.backgroundColor || '#ffffff'}
              onChange={(e) => updateStyle('backgroundColor', e.target.value)}
              className="h-8 w-full"
            />
          </div>

          <div>
            <Label className="text-xs">Border Radius</Label>
            <div className="px-2">
              <Slider
                value={[selectedElement.styles.borderRadius || 0]}
                onValueChange={(value) => updateStyle('borderRadius', value[0])}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {selectedElement.styles.borderRadius || 0}px
            </div>
          </div>

          <div>
            <Label className="text-xs">Padding</Label>
            <div className="px-2">
              <Slider
                value={[selectedElement.styles.padding || 8]}
                onValueChange={(value) => updateStyle('padding', value[0])}
                max={50}
                min={0}
                step={1}
                className="w-full"
              />
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {selectedElement.styles.padding || 8}px
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        variant="destructive" 
        size="sm" 
        className="w-full"
        onClick={() => {
          // This would be handled by parent component
          console.log('Delete element:', selectedElement.id);
        }}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Element
      </Button>
    </div>
  );
}