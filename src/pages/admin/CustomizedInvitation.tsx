import { useState, useCallback } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { DesignCanvas } from "@/components/invitation-designer/DesignCanvas";
import { ComponentLibrary } from "@/components/invitation-designer/ComponentLibrary";
import { PropertiesPanel } from "@/components/invitation-designer/PropertiesPanel";
import { PreviewModal } from "@/components/invitation-designer/PreviewModal";
import { Save, Eye, Download, Undo, Redo } from "lucide-react";
import { toast } from "sonner";

export interface DesignElement {
  id: string;
  type: 'text' | 'image' | 'container' | 'field';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fieldType?: 'bride_name' | 'groom_name' | 'wedding_date' | 'location_text' | 'description1' | 'description2';
  styles: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: number;
    padding?: number;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: 'normal' | 'bold';
    fontStyle?: 'normal' | 'italic';
  };
}

const CustomizedInvitation = () => {
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });
  const [designName, setDesignName] = useState("Untitled Design");
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<DesignElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((newElements: DesignElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const addElement = useCallback((element: Omit<DesignElement, 'id'>) => {
    const newElement: DesignElement = {
      ...element,
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    const newElements = [...elements, newElement];
    setElements(newElements);
    addToHistory(newElements);
    setSelectedElement(newElement.id);
  }, [elements, addToHistory]);

  const updateElement = useCallback((id: string, updates: Partial<DesignElement>) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(newElements);
    addToHistory(newElements);
  }, [elements, addToHistory]);

  const deleteElement = useCallback((id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    addToHistory(newElements);
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  }, [elements, selectedElement, addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setElements([...history[newIndex]]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setElements([...history[newIndex]]);
      setHistoryIndex(newIndex);
    }
  }, [history, historyIndex]);

  const saveDesign = () => {
    // TODO: Implement save to database
    toast.success("Design saved successfully!");
  };

  const exportDesign = () => {
    // TODO: Implement export functionality
    toast.success("Design exported successfully!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <Input 
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                />
                <span className="text-sm text-muted-foreground">Custom Invitation Designer</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={redo} disabled={historyIndex === history.length - 1}>
                <Redo className="w-4 h-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm" onClick={exportDesign}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={saveDesign}>
                <Save className="w-4 h-4 mr-2" />
                Save Design
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <div className="w-80 border-r bg-muted/30">
            <Tabs defaultValue="components" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="settings">Canvas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="components" className="h-full p-4 overflow-auto">
                <ComponentLibrary onAddElement={addElement} />
              </TabsContent>
              
              <TabsContent value="settings" className="h-full p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Canvas Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="canvas-width">Width</Label>
                        <Input
                          id="canvas-width"
                          type="number"
                          value={canvasSize.width}
                          onChange={(e) => setCanvasSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="canvas-height">Height</Label>
                        <Input
                          id="canvas-height"
                          type="number"
                          value={canvasSize.height}
                          onChange={(e) => setCanvasSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Center - Design Canvas */}
          <div className="flex-1 bg-gray-100 overflow-auto">
            <DesignCanvas
              elements={elements}
              selectedElement={selectedElement}
              canvasSize={canvasSize}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
            />
          </div>

          {/* Right Sidebar - Properties Panel */}
          <div className="w-80 border-l bg-background">
            <PropertiesPanel
              selectedElement={selectedElement ? elements.find(el => el.id === selectedElement) : null}
              onUpdateElement={updateElement}
            />
          </div>
        </div>

        {/* Preview Modal */}
        <PreviewModal
          open={showPreview}
          onOpenChange={setShowPreview}
          elements={elements}
          canvasSize={canvasSize}
          designName={designName}
        />
      </div>
    </DndProvider>
  );
};

export default CustomizedInvitation;