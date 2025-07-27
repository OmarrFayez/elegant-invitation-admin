import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/RichTextEditor";

interface Event {
  id: number;
  event_name: string;
  event_date: string;
  phone_number: string;
  email: string;
  description1: string;
  description2: string;
  max_attendance: number;
  wish_account: string;
  location_text: string;
  location_url: string;
  background_image: string;
  background_music: string;
  background_color?: string;
  subtitle?: string;
  slug?: string;
  user_id?: number;
}

interface EventFormProps {
  event?: Event | null;
  onClose: () => void;
}

const EventForm = ({ event, onClose }: EventFormProps) => {
  const [formData, setFormData] = useState({
    event_name: event?.event_name || "",
    event_date: event?.event_date || "",
    phone_number: event?.phone_number || "",
    email: event?.email || "",
    description1: event?.description1 || "",
    description2: event?.description2 || "",
    max_attendance: event?.max_attendance || "",
    wish_account: event?.wish_account || "",
    location_text: event?.location_text || "",
    location_url: event?.location_url || "",
    background_color: event?.background_color || "#f3f4f6",
    subtitle: event?.subtitle || "",
  });

  const [users, setUsers] = useState<{ user_id: number; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(event?.user_id || null);

  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("user_id, name");
      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } else {
        setUsers(data);
      }
    };
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (file: File, path: string) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error } = await supabase.storage.from("wedding-files").upload(filePath, file);
    if (error) throw error;

    const { data } = supabase.storage.from("wedding-files").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let backgroundImagePath = event?.background_image || "";
      let backgroundMusicPath = event?.background_music || "";

      if (backgroundImage) {
        backgroundImagePath = await handleFileUpload(backgroundImage, "images");
      }
      if (backgroundMusic) {
        backgroundMusicPath = await handleFileUpload(backgroundMusic, "music");
      }

      const eventData = {
        ...formData,
        max_attendance: formData.max_attendance
          ? parseInt(formData.max_attendance as string)
          : null,
        background_image: backgroundImagePath,
        background_music: backgroundMusicPath,
        user_id: selectedUserId,
      };

      // Generate slug for new events or when name changes
      if (!event || event.event_name !== formData.event_name) {
        const { data: slugData, error: slugError } = await supabase
          .rpc('generate_event_slug', {
            event_name: formData.event_name
          });
        
        if (slugError) throw slugError;
        (eventData as any).slug = slugData;
      }

      if (event) {
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", event.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event invitation updated successfully",
        });
      } else {
        const { error } = await supabase.from("events").insert([eventData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Event invitation created successfully",
        });
      }

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
          <h1 className="text-3xl font-bold tracking-tight">
            {event ? "Edit" : "Create"} Event Invitation
          </h1>
          <p className="text-muted-foreground">
            {event ? "Update" : "Add"} event invitation details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Fill in the event information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name *</Label>
                <Input
                  id="event_name"
                  name="event_name"
                  value={formData.event_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event_date">Event Date</Label>
                <Input
                  id="event_date"
                  name="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Event subtitle (appears under countdown timer)"
              />
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-2">
              <Label htmlFor="description1">Description 1</Label>
              <RichTextEditor
                value={formData.description1}
                onChange={(value) =>
                  setFormData(prev => ({ ...prev, description1: value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description2">Description 2</Label>
              <RichTextEditor
                value={formData.description2}
                onChange={(value) =>
                  setFormData(prev => ({ ...prev, description2: value }))
                }
              />
            </div>

            {/* Max Attendance & Wish Account */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_attendance">Max Attendance</Label>
                <Input
                  id="max_attendance"
                  name="max_attendance"
                  type="number"
                  value={formData.max_attendance}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wish_account">Wish Money Account</Label>
                <Input
                  id="wish_account"
                  name="wish_account"
                  value={formData.wish_account}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_text">Location Text</Label>
                <Input
                  id="location_text"
                  name="location_text"
                  value={formData.location_text}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location_url">Location URL</Label>
                <Input
                  id="location_url"
                  name="location_url"
                  type="url"
                  value={formData.location_url}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* File Upload and Background Color */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background_image">Background Image</Label>
                <Input
                  id="background_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setBackgroundImage(e.target.files?.[0] || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background_music">Background Music</Label>
                <Input
                  id="background_music"
                  type="file"
                  accept="audio/*"
                  onChange={(e) =>
                    setBackgroundMusic(e.target.files?.[0] || null)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="background_color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    name="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="w-16 h-10 p-1 rounded cursor-pointer"
                  />
                  <Input
                    name="background_color"
                    type="text"
                    value={formData.background_color}
                    onChange={handleInputChange}
                    className="flex-1"
                    placeholder="#f3f4f6"
                  />
                </div>
              </div>
            </div>

            {/* Event Dashboard (user selection) */}
            <div className="space-y-2">
              <Label htmlFor="user_id">Event Dashboard</Label>
              <select
                id="user_id"
                className="w-full border rounded p-2"
                value={selectedUserId ?? ""}
                onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : event ? "Update" : "Create"} Event
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;
