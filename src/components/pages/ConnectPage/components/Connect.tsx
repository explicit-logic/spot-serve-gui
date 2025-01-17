// QRPageComponent.tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Copy } from 'lucide-react';
import QRCode from 'react-qr-code';

interface Props {
  websiteUrl: string;
  onDisconnect: () => void;
  onSendMessage: () => void;
}

export default function Connect({
  websiteUrl,
  onDisconnect,
  onSendMessage,
}: Props) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(websiteUrl);
      toast({
        description: 'Link copied to clipboard!',
        duration: 2000,
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        description: 'Failed to copy link',
        duration: 2000,
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        {/* QR Code Section */}
        <div className="flex justify-center p-4 bg-white rounded-lg">
          <QRCode value={websiteUrl} size={256} />
        </div>

        {/* URL Input Section */}
        <div className="flex space-x-2">
          <Input readOnly value={websiteUrl} className="flex-1" />
          <Button
            variant="outline"
            size="icon"
            onClick={copyToClipboard}
            className="shrink-0"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        {/* Buttons Panel */}
        <div className="flex space-x-4">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
          <Button variant="default" className="flex-1" onClick={onSendMessage}>
            Send a message
          </Button>
        </div>
      </Card>
    </div>
  );
}
