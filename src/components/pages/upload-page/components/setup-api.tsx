import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';

import { useModal } from '@ebay/nice-modal-react';

import TunnelDialog from '@/components/dialogs/tunnel-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Components
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
  const form = useFormContext<Values>();
  const { watch } = form;
  const modal = useModal(TunnelDialog);

  const host = watch('host');
  const port = watch('port');

  const test = async () => {
    try {
      const url: string = await invoke('setup_tunnel', {
        localHost: host,
        localPort: Number(port),
      });
      modal.show({ url });
    } catch (error) {
      console.error(error);
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
          <Button type="button" onClick={test}>
            Test
          </Button>
        </div>
      )}
    </div>
  );
}

export default SetupApi;
