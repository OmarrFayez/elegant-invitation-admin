import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DesignElement } from "@/pages/admin/CustomizedInvitation";

const CustomInvitationPreview = () => {
  const { slug } = useParams();
  const [invitation, setInvitation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchInvitation();
  }, [slug]);

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('customized_invitations')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
        } else {
          throw error;
        }
        return;
      }

      setInvitation(data);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const renderElement = (element: DesignElement) => {
    const elementStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      fontSize: element.styles.fontSize,
      fontFamily: element.styles.fontFamily,
      color: element.styles.color,
      backgroundColor: element.styles.backgroundColor,
      borderRadius: element.styles.borderRadius,
      padding: element.styles.padding,
      textAlign: element.styles.textAlign,
      fontWeight: element.styles.fontWeight,
      fontStyle: element.styles.fontStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.styles.textAlign === 'center' ? 'center' : 
                     element.styles.textAlign === 'right' ? 'flex-end' : 'flex-start',
    };

    if (element.type === 'text') {
      return (
        <div key={element.id} style={elementStyle}>
          {element.content}
        </div>
      );
    }

    if (element.type === 'field') {
      // For preview, show placeholder text for fields
      const fieldLabels = {
        bride_name: 'Bride Name',
        groom_name: 'Groom Name',
        wedding_date: 'Wedding Date',
        location_text: 'Location',
        description1: 'Description 1',
        description2: 'Description 2'
      };
      
      return (
        <div key={element.id} style={elementStyle}>
          {fieldLabels[element.fieldType!] || 'Field'}
        </div>
      );
    }

    if (element.type === 'container') {
      return (
        <div 
          key={element.id} 
          style={{
            ...elementStyle,
            border: '1px dashed #ccc'
          }}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Invitation Not Found</h1>
          <p className="text-muted-foreground">
            The invitation you're looking for doesn't exist or has been unpublished.
          </p>
        </div>
      </div>
    );
  }

  const canvasSize = invitation.canvas_size || { width: 400, height: 600 };
  const elements = invitation.elements || [];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{invitation.design_name}</h1>
          <p className="text-muted-foreground">Custom Wedding Invitation</p>
        </div>
        
        <div className="flex justify-center">
          <div
            className="bg-white shadow-lg relative"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
            }}
          >
            {elements.map((element: DesignElement) => renderElement(element))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomInvitationPreview;