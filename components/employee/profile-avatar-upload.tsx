'use client';

import * as React from 'react';
import { Camera, Trash2, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface ProfileAvatarUploadProps {
  currentPicture?: string | null;
  name: string;
  onPictureUpdated: (newUrl: string | null) => void;
}

export function ProfileAvatarUpload({ currentPicture, name, onPictureUpdated }: ProfileAvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Invalid image type. Please select a JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size exceeds 5MB limit');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/employees/me/avatar', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to upload profile picture');
      }

      onPictureUpdated(json.data.profilePicture);
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error uploading profile picture');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    try {
      setIsUploading(true);
      const res = await fetch('/api/employees/me/avatar', { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete profile picture');
      }

      onPictureUpdated(null);
      toast.success('Profile picture removed');
    } catch (err: any) {
      toast.error(err.message || 'Error deleting profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shadow-md">
          {currentPicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentPicture} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-primary">
              {name ? name.charAt(0).toUpperCase() : <User className="h-12 w-12 text-muted-foreground" />}
            </span>
          )}

          {isUploading ? (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
          title="Upload new picture"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {currentPicture ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isUploading}
          className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Picture
        </Button>
      ) : null}
    </div>
  );
}
