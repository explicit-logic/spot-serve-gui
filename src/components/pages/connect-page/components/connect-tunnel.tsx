import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Website } from '@/schemas/website';
import { Copy, Server } from 'lucide-react';
import { useRef, useState } from 'react';
import { useLocation } from 'react-router';

export default function ConnectTunnel() {
  const { state } = useLocation() as { state: Website };
  const { backend, tunnel, port } = state || {};
  const originRef = useRef<HTMLInputElement>(null);
  const remoteRef = useRef<HTMLInputElement>(null);
  const [showOriginTooltip, setShowOriginTooltip] = useState(false);
  const [showRemoteTooltip, setShowRemoteTooltip] = useState(false);
  const origin = `http://localhost:${port}`;

  const copyToClipboard = (
    ref: React.RefObject<HTMLInputElement | null>,
    setTooltip: (show: boolean) => void,
  ) => {
    if (ref.current) {
      navigator.clipboard.writeText(ref.current.value);
      setTooltip(true);
      // Hide tooltip after 2 seconds
      setTimeout(() => setTooltip(false), 2000);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline" disabled={!backend}>
          <Server />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mr-3">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Tunnel</h4>
            <p className="text-sm text-muted-foreground">
              Proxies remote traffic to your origins
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-4 items-center gap-1">
              <Label htmlFor="origin">Origin</Label>
              <div className="col-span-3 flex gap-1">
                <Input
                  id="origin"
                  ref={originRef}
                  defaultValue={origin}
                  className="flex-1 h-8 text-xs"
                  readOnly
                />
                <TooltipProvider>
                  <Tooltip open={showOriginTooltip}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          copyToClipboard(originRef, setShowOriginTooltip)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copied!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-1">
              <Label htmlFor="remote">Remote</Label>
              <div className="col-span-3 flex gap-1">
                <Input
                  id="remote"
                  ref={remoteRef}
                  defaultValue={tunnel}
                  className="flex-1 h-8 text-xs"
                  readOnly
                />
                <TooltipProvider>
                  <Tooltip open={showRemoteTooltip}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          copyToClipboard(remoteRef, setShowRemoteTooltip)
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copied!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
