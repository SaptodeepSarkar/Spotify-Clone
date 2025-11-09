// EnhancedCreatePlaylist.tsx - UPDATED
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

interface EnhancedCreatePlaylistProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (playlistData: {
    name: string;
    description?: string;
    coverFile?: File;
  }) => void;
}

export default function EnhancedCreatePlaylist({ open, onClose, onSubmit }: EnhancedCreatePlaylistProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [coverPreview, setCoverPreview] = useState<string | undefined>();

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      coverFile,
    });

    // Reset form
    setName("");
    setDescription("");
    setCoverFile(undefined);
    setCoverPreview(undefined);
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setName("");
    setDescription("");
    setCoverFile(undefined);
    setCoverPreview(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-create-playlist">
        <DialogHeader>
          <DialogTitle>Create Playlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image (Optional)</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Playlist Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Playlist Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Playlist"
              required
              maxLength={100}
              data-testid="input-playlist-name"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
              rows={3}
              maxLength={300}
              data-testid="input-playlist-description"
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/300
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleClose}
              data-testid="button-cancel-playlist"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim()}
              data-testid="button-create-playlist-submit"
            >
              Create Playlist
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}