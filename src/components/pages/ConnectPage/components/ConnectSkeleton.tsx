import { Loader2 } from 'lucide-react';

interface Props {
  label?: string;
}

export default function ConnectSkeleton({ label = 'Loading...' }: Props) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{label}</p>
      </div>
    </div>
  );
}
