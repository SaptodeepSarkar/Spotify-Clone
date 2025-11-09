import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (songData: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    audioUrl: string;
    coverFile?: File;
  }) => void;
  editMode?: boolean;
  initialData?: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    audioUrl: string;
  };
}

export default function AddSongModal({ open, onClose, onSubmit, editMode = false, initialData }: AddSongModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [album, setAlbum] = useState(initialData?.album || "");
  const [duration, setDuration] = useState(initialData?.duration || 0);
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
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
    onSubmit({
      title,
      artist,
      album,
      duration,
      audioUrl,
      coverFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg" data-testid="modal-add-song">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Song' : 'Add New Song'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <Input
                id="cover"
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                data-testid="input-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                data-testid="input-artist"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                required
                data-testid="input-album"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (seconds)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                data-testid="input-duration"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio URL</Label>
            <Input
              id="audioUrl"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              required
              placeholder="https://example.com/song.mp3"
              data-testid="input-audio-url"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-song">
              {editMode ? 'Update' : 'Add'} Song
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
