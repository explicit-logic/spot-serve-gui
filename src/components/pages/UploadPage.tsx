import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Cloud, File, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface UploadDropzoneProps {
  className?: string;
  onUpload?: (file: File) => Promise<void>;
}

export function Component() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl p-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold">Upload ZIP Archive</h1>
          <UploadDropzone
            onUpload={async (file) => {
              navigate('/connect', { replace: true, state: { file } });
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function UploadDropzone({ className, onUpload }: UploadDropzoneProps) {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !onUpload) return;

      try {
        setIsUploading(true);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 95) {
              clearInterval(interval);
              return prev;
            }
            return prev + 5;
          });
        }, 100);

        await onUpload(file);

        clearInterval(interval);
        setUploadProgress(100);
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        'application/zip': ['.zip'],
      },
      maxFiles: 1,
      multiple: false,
    });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps({
          className: cn(
            'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 transition-colors',
            isDragActive
              ? 'border-primary/50 bg-primary/5'
              : 'border-gray-300 hover:border-primary/50 hover:bg-primary/5',
            isUploading && 'pointer-events-none opacity-60',
          ),
        })}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
              <p className="mt-2 text-sm text-gray-500">
                Uploading your file...
              </p>
            </>
          ) : (
            <>
              <Cloud className="h-10 w-10 text-gray-500" />
              <p className="mt-2 text-base font-medium">
                Drop your ZIP file here, or{' '}
                <span className="text-primary hover:underline">browse</span>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Only .zip files are supported
              </p>
            </>
          )}
        </div>

        {acceptedFiles[0] && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <File className="h-4 w-4" />
            <span>{acceptedFiles[0].name}</span>
          </div>
        )}
      </div>

      {isUploading && (
        <div className="mt-4 space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-center text-sm text-gray-500">
            {uploadProgress}% uploaded
          </p>
        </div>
      )}
    </div>
  );
}
