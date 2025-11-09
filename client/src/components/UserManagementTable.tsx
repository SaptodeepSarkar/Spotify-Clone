import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

interface User {
  id: string;
  username: string;
  role: string;
  suspended: boolean;
  suspendedUntil?: string;
}

interface UserManagementTableProps {
  users: User[];
  onSuspend: (userId: string) => void;
  onUnsuspend: (userId: string) => void;
}

export default function UserManagementTable({ users, onSuspend, onUnsuspend }: UserManagementTableProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-[1fr_150px_150px_100px] gap-4 px-4 py-2 text-sm text-muted-foreground border-b border-border">
        <div>Username</div>
        <div>Role</div>
        <div>Status</div>
        <div></div>
      </div>
      
      <div className="divide-y divide-border">
        {users.map((user) => (
          <div
            key={user.id}
            className="grid grid-cols-[1fr_150px_150px_100px] gap-4 px-4 py-3 hover-elevate items-center"
            data-testid={`row-user-${user.id}`}
          >
            <div className="font-medium" data-testid={`text-username-${user.id}`}>{user.username}</div>
            
            <div>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} data-testid={`badge-role-${user.id}`}>
                {user.role}
              </Badge>
            </div>
            
            <div>
              <Badge 
                variant={user.suspended ? 'destructive' : 'secondary'}
                data-testid={`badge-status-${user.id}`}
              >
                {user.suspended ? 'Suspended' : 'Active'}
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" data-testid={`button-menu-user-${user.id}`}>
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {user.suspended ? (
                  <DropdownMenuItem onClick={() => onUnsuspend(user.id)} data-testid={`menu-unsuspend-${user.id}`}>
                    Unsuspend
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onSuspend(user.id)} data-testid={`menu-suspend-${user.id}`}>
                    Suspend
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
