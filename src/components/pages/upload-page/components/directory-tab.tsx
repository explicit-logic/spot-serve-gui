import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { TABS } from '../constants';

import { toast } from '@/hooks/use-toast';
import { createZipFromDirectory } from '@/utils/create-zip-from-directory';
import { open } from '@tauri-apps/plugin-dialog';

import type { Values } from '@/schemas/website';

function DirectoryTab() {
  const { setValue, watch } = useFormContext<Values>();
  const [isLoading, setIsLoading] = useState(false);

  const selectedDirectory = watch('directory');

  // Directory selection handler
  const handleDirectorySelect = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        recursive: true,
      });

      if (selected && !Array.isArray(selected)) {
        setIsLoading(true);
        const file = await createZipFromDirectory(selected);
        setValue('file', file);
        setValue('directory', selected);
        toast({
          title: 'Directory Selected',
          description: selected,
          duration: 700,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to select directory',
        description: (error as Error).toString(),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TabsContent value={TABS.DIRECTORY}>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Select a directory containing your static website files. The
            directory should include an index.html file and all necessary
            assets.
          </p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              disabled={isLoading}
              onClick={handleDirectorySelect}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Choose Directory
            </Button>
            {selectedDirectory && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedDirectory}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default DirectoryTab;
