import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';
import { open } from '@tauri-apps/plugin-dialog';

import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import UploadTab from './components/upload-tab';

import { TABS } from './constants';

import { type Values, schema } from './schema';

const defaultValues = {
  host: '',
  port: 3000,
  file: undefined,
};

export const Component = () => {
  const [showApiFields, setShowApiFields] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(TABS.DIRECTORY);
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(
    null,
  );
  const navigate = useNavigate();

  // Form initialization
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const { formState, reset } = form;
  const { errors } = formState;

  // Handle API form submission
  const onSubmit = async (data: Values) => {
    try {
      // Implement your API configuration logic here
      console.log('API Config:', data);

      navigate('/connect', { replace: true, state: data });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).toString(),
        variant: 'destructive',
      });
    }
  };

  // Directory selection handler
  const handleDirectorySelect = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && !Array.isArray(selected)) {
        setSelectedDirectory(selected);
        toast({
          title: 'Directory Selected',
          description: selected,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to select directory',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto p-4 max-w-3xl min-h-screen"
      >
        {/* API Configuration Section */}
        <div className="mb-6">
          <Toggle
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
            </div>
          )}
        </div>

        {/* Tabs Section */}
        <Tabs
          defaultValue={TABS.DIRECTORY}
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TABS.DIRECTORY}>Directory</TabsTrigger>
            <TabsTrigger value={TABS.UPLOAD}>Upload</TabsTrigger>
          </TabsList>

          <TabsContent value={TABS.DIRECTORY}>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  Select a directory containing your static website files. The
                  directory should include an index.html file and all necessary
                  assets.
                </p>
                <div className="space-y-2">
                  <Button variant="secondary" onClick={handleDirectorySelect}>
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

          <UploadTab setActiveTab={setActiveTab} />
        </Tabs>
        <p className="text-[0.8rem] font-medium text-destructive mt-2">
          {errors.file?.message}
        </p>

        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 p-4 flex justify-end space-x-4 bg-white dark:bg-zinc-950">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(defaultValues)}
          >
            Reset
          </Button>
          <Button type="submit" className="px-24">
            Deploy
          </Button>
        </div>
      </form>
    </Form>
  );
};
