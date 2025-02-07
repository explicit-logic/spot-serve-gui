import { useToast } from '@/hooks/use-toast';
import { useModal } from '@ebay/nice-modal-react';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

import { createTunnel } from '@/commands/tunnel';

import TunnelDialog from '@/components/dialogs/tunnel-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toggle } from '@/components/ui/toggle';

import { useFormContext } from 'react-hook-form';

import type { Values } from '@/schemas/website';

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';

function SetupApi() {
  const [isLoading, setIsLoading] = useState(false);
  const form = useFormContext<Values>();
  const { watch } = form;
  const modal = useModal(TunnelDialog);
  const { toast } = useToast();

  const port = watch('port');
  const backend = watch('backend');

  const test = async () => {
    try {
      setIsLoading(true);
      // const url: string = await setupTunnel(port, host);
      const response = await createTunnel('localhost', 3000);
      console.log(response);
      const { url } = response;
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
        pressed={backend}
        onClick={() => form.setValue('backend', !backend)}
      >
        Add API
      </Toggle>

      {backend && (
        <div className="flex gap-2 mt-4">
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
