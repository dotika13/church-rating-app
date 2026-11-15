import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Group } from "@/db/schema";

interface GroupCardProps {
  group: Group & { memberCount?: number };
  onClick: () => void;
}

export function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <button onClick={onClick} className={cn("w-full p-4 rounded-xl border bg-card border-border text-left transition hover:shadow-md")}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold">{group.name}</h3>
          {group.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{group.description}</p>}
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>{group.memberCount || 0} members</span>
            <span>Invite: {group.inviteCode}</span>
          </div>
        </div>
      </div>
    </button>
  );
}