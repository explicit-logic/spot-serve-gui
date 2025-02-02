import { useCallback, useEffect, useRef, useState } from 'react';

import { TabsContent } from '@/components/ui/tabs';

import { cn } from '@/lib/utils';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import { Cloud, FileArchive } from 'lucide-react';

import { useFormContext } from 'react-hook-form';

import type { Values } from '@/schemas/website';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatFileSize } from '@/helpers/format-file-size';
import { toast } from '@/hooks/use-toast';

import { TABS } from '../constants';

import { pathToFile } from '@/utils/path-to-file';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// File validation
const validateFile = (file: File): boolean => {
  if (!file.type.includes('zip') && !file.name.endsWith('.zip')) {
    toast({
      title: 'Invalid file type',
      description: 'Please upload a ZIP file',
      variant: 'destructive',
    });
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    toast({
      title: 'File too large',
      description: 'File size must be less than 100MB',
      variant: 'destructive',
    });
    return false;
  }

  return true;
};

interface Props {
  setActiveTab: (tab: string) => void;
}

function UploadTab(props: Props) {
  const { setActiveTab } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { watch, setValue } = useFormContext<Values>();
  const selectedFile = watch('file');

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      setIsDragging(false);
      if (!validateFile(file)) return;
      setValue('file', file);
    },
    [setValue],
  );

  useEffect(() => {
    const currentWebview = getCurrentWebview();
    const dragDropOff = currentWebview.onDragDropEvent(async ({ payload }) => {
      try {
        if (payload.type === 'enter') {
          setActiveTab(TABS.UPLOAD);
          setIsDragging(true);
        }
        // if (payload.type === 'over') {
        //   setIsDragging(true);
        // }
        if (payload.type === 'drop') {
          const { paths } = payload;
          const [path] = paths;
          setIsDragging(false);

          const file = await pathToFile(path);
          handleFile(file);
        }
        if (payload.type === 'leave') {
          setIsDragging(false);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: (error as Error).toString(),
          variant: 'destructive',
        });
      }
    });

    return () => void dragDropOff.then((fn) => fn());
  }, [handleFile, setActiveTab]);

  return (
    <TabsContent value={TABS.UPLOAD}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>Upload your ZIP archive (max 100MB)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              'border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer transition-colors hover:border-primary hover:bg-primary/5',
              isDragging && 'border-primary bg-primary/5',
              // isUploading && 'pointer-events-none opacity-60'
            )}
            onClick={handleClick}
            onKeyDown={handleClick}
          >
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileInput}
              accept=".zip"
              style={{ display: 'none' }}
            />
            <div className="flex flex-col items-center gap-4">
              <Cloud className="h-10 w-10 text-gray-400" />
              {isDragging ? (
                <p className="text-primary">Drop the file here</p>
              ) : (
                <p className="text-gray-600">
                  Drag & drop a ZIP file here, or click to select
                </p>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-4">
                <FileArchive className="h-8 w-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default UploadTab;
