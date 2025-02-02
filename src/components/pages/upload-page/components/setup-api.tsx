import { useToast } from '@/hooks/use-toast';
import { useModal } from '@ebay/nice-modal-react';
import { invoke } from '@tauri-apps/api/core';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import TunnelDialog from '@/components/dialogs/tunnel-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';

import { useFormContext } from 'react-hook-form';

import type { Values } from '../schema';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

function SetupApi() {
  const [showApiFields, setShowApiFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useFormContext<Values>();
  const { watch } = form;
  const modal = useModal(TunnelDialog);
  const { toast } = useToast();

  const host = watch('host');
  const port = watch('port');

  const test = async () => {
    try {
      setIsLoading(true);
      const url: string = await invoke('setup_tunnel', {
        localHost: host,
        localPort: Number(port),
      });
      toast({
        description: 'Connection established',
        duration: 1000,
      });
      modal.show({ url });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to connect',
        description: (error as Error).toString(),
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <Toggle
        type="button"
        variant="outline"
        onClick={() => setShowApiFields(!showApiFields)}
      >
        Add API
      </Toggle>

      {showApiFields && (
        <div className="flex gap-2 mt-4">
          <div className="flex flex-row space-x-2">
            <Label htmlFor="host" className="py-3">
              Host
            </Label>

            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Input
                      placeholder="127.0.0.1"
                      className="w-64"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row space-x-2">
            <Label htmlFor="port" className="py-3">
              Port
            </Label>
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormControl>
                    <Input
                      placeholder="3000"
                      type="text"
                      inputMode="numeric"
                      className="max-w-24"
                      pattern="[0-9]*"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="button" disabled={isLoading} onClick={test}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Test
          </Button>
        </div>
      )}
    </div>
  );
}

export default SetupApi;
