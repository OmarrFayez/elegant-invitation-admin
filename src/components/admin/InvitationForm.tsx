import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RichTextEditor from "@/components/RichTextEditor";

interface Wedding {
  id: number;
  wedding_name: string;
  groom_name: string;
  bride_name: string;
  description1: string;
  description2: string;
  phone_number: string;
  email: string;
  wedding_date: string;
  max_attendance: number;
  whish_account: string;
  location_text: string;
  location_url: string;
  background_image: string;
  background_music: string;
  user_id?: number;
}

interface InvitationFormProps {
  wedding?: Wedding | null;
  onClose: () => void;
}

const InvitationForm = ({ wedding, onClose }: InvitationFormProps) => {
  const [formData, setFormData] = useState({
    wedding_name: wedding?.wedding_name || "",
    groom_name: wedding?.groom_name || "",
    bride_name: wedding?.bride_name || "",
    description1: wedding?.description1 || "",
    description2: wedding?.description2 || "",
    phone_number: wedding?.phone_number || "",
    email: wedding?.email || "",
    wedding_date: wedding?.wedding_date || "",
    max_attendance: wedding?.max_attendance || "",
    whish_account: wedding?.whish_account || "",
    location_text: wedding?.location_text || "",
    location_url: wedding?.location_url || "",
  });

  const [users, setUsers] = useState<{ user_id: number; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(wedding?.user_id || null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      let backgroundImagePath = wedding?.background_image || "";
      let backgroundMusicPath = wedding?.background_music || "";

      if (backgroundImage) {
        backgroundImagePath = await handleFileUpload(backgroundImage, "images");
      }
      if (backgroundMusic) {
        backgroundMusicPath = await handleFileUpload(backgroundMusic, "music");
      }

      const weddingData = {
        ...formData,
        max_attendance: formData.max_attendance
          ? parseInt(formData.max_attendance as string)
          : null,
        background_image: backgroundImagePath,
        background_music: backgroundMusicPath,
        user_id: selectedUserId,
      };

      if (wedding) {
        const { error } = await supabase
          .from("weddings")
          .update(weddingData)
          .eq("id", wedding.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Wedding invitation updated successfully",
        });
      } else {
        const { error } = await supabase.from("weddings").insert([weddingData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Wedding invitation created successfully",
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
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {wedding ? "Edit" : "Create"} Invitation
          </h1>
          <p className="text-muted-foreground">
            {wedding ? "Update" : "Add"} wedding invitation details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wedding Details</CardTitle>
          <CardDescription>Fill in the wedding information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Wedding Name and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wedding_name">Wedding Name *</Label>
                <Input
                  id="wedding_name"
                  name="wedding_name"
                  value={formData.wedding_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wedding_date">Wedding Date</Label>
                <Input
                  id="wedding_date"
                  name="wedding_date"
                  type="date"
                  value={formData.wedding_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Groom and Bride */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groom_name">Groom Name</Label>
                <Input
                  id="groom_name"
                  name="groom_name"
                  value={formData.groom_name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bride_name">Bride Name</Label>
                <Input
                  id="bride_name"
                  name="bride_name"
                  value={formData.bride_name}
                  onChange={handleInputChange}
                />
              </div>
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

            {/* Attendance & Account */}
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
                <Label htmlFor="whish_account">Wish Money Account</Label>
                <Input
                  id="whish_account"
                  name="whish_account"
                  value={formData.whish_account}
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

            {/* File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            {/* Wedding Dashboard (user selection) */}
            <div className="space-y-2">
              <Label htmlFor="user_id">Wedding Dashboard</Label>
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
                {loading ? "Saving..." : wedding ? "Update" : "Create"} Invitation
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvitationForm;
