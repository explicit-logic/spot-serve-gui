import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useForm } from 'react-hook-form';

import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import UploadTab from './components/upload-tab';

import { TABS } from './constants';

import { type Values, type Website, schema } from '@/schemas/website';
import DirectoryTab from './components/directory-tab';
import SetupApi from './components/setup-api';

import { tunnelManager } from '@/lib/tunnel';

const defaultValues = {
  backend: false,
  host: '127.0.0.1',
  port: 3000,
  file: undefined,
};

export const Component = () => {
  const [activeTab, setActiveTab] = useState<string>(TABS.DIRECTORY);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
      const { backend, file, port } = data;
      const state: Website = {
        backend,
        file,
        port,
      };

      if (backend) {
        state.tunnel = await tunnelManager.startTunnel(port);
      }

      navigate('/connect', { replace: true, state });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).toString(),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto p-4 max-w-3xl min-h-screen"
      >
        {/* API Configuration Section */}
        <SetupApi />

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

          <DirectoryTab />
          <UploadTab setActiveTab={setActiveTab} />
        </Tabs>
        <p className="text-[0.8rem] font-medium text-destructive mt-2">
          {errors.file?.message}
        </p>

        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 p-4 flex justify-end space-x-4 bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset(defaultValues)}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading} className="w-60">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Deploy
          </Button>
        </div>
      </form>
    </Form>
  );
};
