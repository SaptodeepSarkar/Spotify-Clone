// components/AddSongModal.tsx
import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, Music, Image, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AddSongModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (songData: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    audioFile?: File;
    audioUrl?: string;
    coverFile?: File;
    coverImageUrl?: string;
  }) => void;
  editMode?: boolean;
  initialData?: {
    title: string;
    artist: string;
    album: string;
    duration: number;
    audioUrl: string;
    coverUrl?: string;
  };
}

export default function AddSongModal({ open, onClose, onSubmit, editMode = false, initialData }: AddSongModalProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [artist, setArtist] = useState(initialData?.artist || "");
  const [album, setAlbum] = useState(initialData?.album || "");
  const [duration, setDuration] = useState(initialData?.duration || 0);
  
  // Audio upload state
  const [audioFile, setAudioFile] = useState<File | undefined>();
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [audioUploadType, setAudioUploadType] = useState<"file" | "url">("file");
  
  // Cover upload state
  const [coverFile, setCoverFile] = useState<File | undefined>();
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverUrl || "");
  const [coverPreview, setCoverPreview] = useState<string | undefined>(initialData?.coverUrl || "");
  const [coverUploadType, setCoverUploadType] = useState<"file" | "url">("file");
  
  const [durationLoading, setDurationLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title);
        setArtist(initialData.artist);
        setAlbum(initialData.album);
        setDuration(initialData.duration);
        setAudioUrl(initialData.audioUrl);
        setCoverImageUrl(initialData.coverUrl || "");
        setCoverPreview(initialData.coverUrl || "");
        // Set upload types based on existing data
        setAudioUploadType("url");
        setCoverUploadType(initialData.coverUrl ? "url" : "file");
      } else {
        // Reset form for new song
        setTitle("");
        setArtist("");
        setAlbum("");
        setDuration(0);
        setAudioFile(undefined);
        setAudioUrl("");
        setCoverFile(undefined);
        setCoverImageUrl("");
        setCoverPreview("");
        setAudioUploadType("file");
        setCoverUploadType("file");
      }
    }
  }, [open, initialData]);

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCoverImageUrl(url);
    setCoverPreview(url);
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      
      // Extract duration from audio file
      setDurationLoading(true);
      try {
        const audio = new Audio();
        const objectUrl = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(objectUrl);
            resolve(audio.duration);
          });
          audio.addEventListener('error', reject);
          audio.src = objectUrl;
        });
        
        const extractedDuration = Math.floor(audio.duration);
        setDuration(extractedDuration);
      } catch (error) {
        console.error('Error extracting audio duration:', error);
        // Keep manual duration input if extraction fails
      } finally {
        setDurationLoading(false);
      }
    }
  };

  const handleAudioUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioUrl(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title || !artist || !duration) {
      alert("Please fill in all required fields");
      return;
    }

    if (audioUploadType === "file" && !audioFile) {
      alert("Please upload an audio file");
      return;
    }

    if (audioUploadType === "url" && !audioUrl) {
      alert("Please provide an audio URL");
      return;
    }

    if (coverUploadType === "file" && !coverFile && !coverPreview) {
      alert("Please upload a cover image or provide a URL");
      return;
    }

    if (coverUploadType === "url" && !coverImageUrl) {
      alert("Please provide a cover image URL");
      return;
    }

    onSubmit({
      title,
      artist,
      album,
      duration,
      audioFile: audioUploadType === "file" ? audioFile : undefined,
      audioUrl: audioUploadType === "url" ? audioUrl : undefined,
      coverFile: coverUploadType === "file" ? coverFile : undefined,
      coverImageUrl: coverUploadType === "url" ? coverImageUrl : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl" data-testid="modal-add-song">
        <DialogHeader>
          <DialogTitle>{editMode ? 'Edit Song' : 'Add New Song'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Cover Image Section */}
          <div className="space-y-2">
            <Label htmlFor="cover">Cover Image</Label>
            <Tabs value={coverUploadType} onValueChange={(value) => setCoverUploadType(value as "file" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Provide URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="cover"
                      type="file"
                      accept="image/*"
                      onChange={handleCoverFileChange}
                      data-testid="input-cover-file"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported formats: JPEG, PNG, GIF, WebP
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/cover.jpg"
                  value={coverImageUrl}
                  onChange={handleCoverUrlChange}
                  data-testid="input-cover-url"
                />
                {coverPreview && (
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="input-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
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
                data-testid="input-album"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">
                Duration (seconds) *
                {durationLoading && <span className="text-xs text-muted-foreground ml-2">Calculating...</span>}
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                required
                min="1"
                disabled={durationLoading}
                data-testid="input-duration"
              />
            </div>
          </div>

          {/* Audio File Section */}
          <div className="space-y-2">
            <Label htmlFor="audio">Audio File *</Label>
            <Tabs value={audioUploadType} onValueChange={(value) => setAudioUploadType(value as "file" | "url")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Provide URL
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="file" className="space-y-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  data-testid="input-audio-file"
                />
                <p className="text-xs text-muted-foreground">
                  Supported formats: MP3, WAV, OGG, M4A, AAC
                </p>
                {audioFile && (
                  <p className="text-xs text-green-600">
                    Selected: {audioFile.name}
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/song.mp3"
                  value={audioUrl}
                  onChange={handleAudioUrlChange}
                  data-testid="input-audio-url"
                />
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose} data-testid="button-cancel">
              Cancel
            </Button>
            <Button type="submit" data-testid="button-submit-song" disabled={durationLoading}>
              {editMode ? 'Update' : 'Add'} Song
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}