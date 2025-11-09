import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SuspendUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { days: number; reason: string }) => void;
  username: string;
}

export default function SuspendUserModal({ open, onClose, onSubmit, username }: SuspendUserModalProps) {
  const [days, setDays] = useState(7);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ days, reason });
  };

  const quickOptions = [
    { label: '1 Day', days: 1 },
    { label: '1 Week', days: 7 },
    { label: '1 Month', days: 30 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-suspend-user">
        <DialogHeader>
          <DialogTitle>Suspend User: {username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="flex gap-2">
              {quickOptions.map((option) => (
                <Button
                  key={option.days}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setDays(option.days)}
                  data-testid={`button-quick-${option.days}`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="days">Suspension Duration (days)</Label>
            <Input
              id="days"
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1}
              required
              data-testid="input-days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this user is being suspended..."
              rows={3}
              data-testid="input-reason"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="secondary" onClick={onClose} data-testid="button-cancel-suspend">
              Cancel
            </Button>
            <Button type="submit" variant="destructive" data-testid="button-submit-suspend">
              Suspend User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
