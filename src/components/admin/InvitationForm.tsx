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
  time?: string;
  church_time?: string;
  church_location?: string;
  church_name?: string;
  omt?: string;
  bank?: string;
  max_attendance: number;
  wish_account: string;
  location_text: string;
  location_url: string;
  background_image: string;
  mobile_background_image?: string;
  background_music: string;
  background_color?: string;
  language?: string;
  attendance_deadline?: string;
  slug?: string;
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
    time: wedding?.time || "",
    church_time: wedding?.church_time || "",
    church_location: wedding?.church_location || "",
    church_name: wedding?.church_name || "",
    omt: wedding?.omt || "",
    bank: wedding?.bank || "",
    max_attendance: wedding?.max_attendance || "",
    wish_account: wedding?.wish_account || "",
    location_text: wedding?.location_text || "",
    location_url: wedding?.location_url || "",
    background_color: wedding?.background_color || "#f3f4f6",
    language: wedding?.language || "en",
    attendance_deadline: wedding?.attendance_deadline || "",
  });

  const [users, setUsers] = useState<{ user_id: number; name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(wedding?.user_id || null);

  const [loading, setLoading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [mobileBackgroundImage, setMobileBackgroundImage] = useState<File | null>(null);
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
      let backgroundImagePath = wedding?.background_image || "";
      let mobileBackgroundImagePath = wedding?.mobile_background_image || "";
      let backgroundMusicPath = wedding?.background_music || "";

      if (backgroundImage) {
        backgroundImagePath = await handleFileUpload(backgroundImage, "images");
      }
      if (mobileBackgroundImage) {
        mobileBackgroundImagePath = await handleFileUpload(mobileBackgroundImage, "images");
      }
      if (backgroundMusic) {
        backgroundMusicPath = await handleFileUpload(backgroundMusic, "music");
      }

      const weddingData = {
        ...formData,
        max_attendance: formData.max_attendance
          ? parseInt(formData.max_attendance as string)
          : null,
        // Convert empty time strings to null for PostgreSQL compatibility
        time: formData.time || null,
        church_time: formData.church_time || null,
        background_image: backgroundImagePath,
        mobile_background_image: mobileBackgroundImagePath,
        background_music: backgroundMusicPath,
        user_id: selectedUserId,
      };

      // Generate slug for new weddings or when names change
      if (!wedding || 
          wedding.groom_name !== formData.groom_name || 
          wedding.bride_name !== formData.bride_name ||
          wedding.language !== formData.language) {
        // Generate a simple slug from the bride and groom names
        const slug = `${formData.groom_name}-${formData.bride_name}`.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        (weddingData as any).slug = slug;
      }

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
            {/* Language Selection */}
            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <select
                id="language"
                name="language"
                className="w-full border rounded p-2"
                value={formData.language}
                onChange={handleInputChange}
                required
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            </div>

            {/* Wedding Name, Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wedding_name">Wedding Name *</Label>
                <Input
                  id="wedding_name"
                  name="wedding_name"
                  value={formData.wedding_name}
                  onChange={handleInputChange}
                  required
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
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
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  name="time"
                  type="time"
                  value={formData.time}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Attendance Deadline */}
            <div className="space-y-2">
              <Label htmlFor="attendance_deadline">Attendance Deadline</Label>
              <Input
                id="attendance_deadline"
                name="attendance_deadline"
                type="date"
                value={formData.attendance_deadline}
                onChange={handleInputChange}
              />
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
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bride_name">Bride Name</Label>
                <Input
                  id="bride_name"
                  name="bride_name"
                  value={formData.bride_name}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
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

            {/* Church Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="church_name">Church Name</Label>
                <Input
                  id="church_name"
                  name="church_name"
                  value={formData.church_name}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church_time">Church Time</Label>
                <Input
                  id="church_time"
                  name="church_time"
                  type="time"
                  value={formData.church_time || ""}
                  onChange={handleInputChange}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="church_location">Church Location</Label>
                <Input
                  id="church_location"
                  name="church_location"
                  value={formData.church_location}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank">Bank</Label>
                <Input
                  id="bank"
                  name="bank"
                  value={formData.bank}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="omt">OMT</Label>
                <Input
                  id="omt"
                  name="omt"
                  value={formData.omt}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
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

            {/* Descriptions */}
            <div className="space-y-2">
              <Label htmlFor="description1">Description 1</Label>
              <RichTextEditor
                value={formData.description1}
                onChange={(value) =>
                  setFormData(prev => ({ ...prev, description1: value }))
                }
                isArabic={formData.language === 'ar'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description2">Description 2</Label>
              <RichTextEditor
                value={formData.description2}
                onChange={(value) =>
                  setFormData(prev => ({ ...prev, description2: value }))
                }
                isArabic={formData.language === 'ar'}
              />
            </div>

            {/* Attendance */}
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

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_text">Location Text</Label>
                <Input
                  id="location_text"
                  name="location_text"
                  value={formData.location_text}
                  onChange={handleInputChange}
                  className={formData.language === 'ar' ? 'text-right' : ''}
                  dir={formData.language === 'ar' ? 'rtl' : 'ltr'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="background_image">Background Image (Desktop)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Recommended size: 1920x1080 pixels (16:9 aspect ratio)
                </p>
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
                <Label htmlFor="mobile_background_image">Background Image (Mobile)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Recommended size: 1080x1920 pixels (9:16 aspect ratio)
                </p>
                <Input
                  id="mobile_background_image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setMobileBackgroundImage(e.target.files?.[0] || null)
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
