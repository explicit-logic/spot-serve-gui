import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toggle } from '@/components/ui/toggle';

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

import DirectoryTab from './components/directory-tab';
import { type Values, schema } from './schema';

const defaultValues = {
  host: '127.0.0.1',
  port: 3000,
  file: undefined,
};

export const Component = () => {
  const [showApiFields, setShowApiFields] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(TABS.DIRECTORY);
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
      navigate('/connect', { replace: true, state: data });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).toString(),
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

          <DirectoryTab />
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
