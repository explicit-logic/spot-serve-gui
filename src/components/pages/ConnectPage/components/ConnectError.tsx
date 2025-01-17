import { Button } from '@/components/ui/button'; // Import shadcn Button component
// components/FullPageError.tsx
import { XCircle } from 'lucide-react'; // Using XCircle for error icon

interface FullPageErrorProps {
  message?: string;
  retryAction?: () => void;
}

export default function ConnectError({
  message = 'Something went wrong',
  retryAction,
}: FullPageErrorProps) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <XCircle className="h-6 w-6 text-destructive" />
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>

        {retryAction && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryAction}
            className="mt-2"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
