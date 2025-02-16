import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { openUrl } from '@tauri-apps/plugin-opener';
import { ArrowLeft, Copy } from 'lucide-react';
import QRCode from 'react-qr-code';
import ConnectStatus from './connect-status';
import ConnectTunnel from './connect-tunnel';

interface Props {
  websiteUrl: string;
  goBack: () => void;
}

export default function Connect({ websiteUrl, goBack }: Props) {
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

  const openWebsite = async () => {
    await openUrl(websiteUrl);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-center p-3">
        <div className="flex flex-1 justify-start items-center">
          <Button type="button" size="icon" variant="outline" onClick={goBack}>
            <ArrowLeft />
          </Button>
        </div>
        <ConnectStatus />
        <div className="flex flex-1 justify-end">
          <ConnectTunnel />
        </div>
      </header>
      <main className="flex-auto flex items-center justify-center mb-16">
        <Card className="w-full max-w-lg p-6 space-y-6">
          {/* QR Code Section */}
          <div className="flex justify-center">
            <div
              className="p-4 rounded-lg border border-gray-300 hover:border-pink-400 cursor-pointer"
              onClick={openWebsite}
              onKeyDown={openWebsite}
            >
              <QRCode value={websiteUrl} size={256} />
            </div>
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
        </Card>
      </main>
    </div>
  );
}
