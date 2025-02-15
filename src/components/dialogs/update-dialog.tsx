import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { getVersion } from '@tauri-apps/api/app';
import { relaunch } from '@tauri-apps/plugin-process';
import { type Update, check } from '@tauri-apps/plugin-updater';
import { useCallback, useEffect, useState } from 'react';

function formatDate(dateString: string) {
  try {
    // Split the date and time parts
    const [datePart, timePart] = dateString.split(' ');

    // Split the date into YYYY, MM, DD
    const [year, month, day] = datePart.split('-').map(Number);

    // Split the time into HH, MM, SS and milliseconds
    const [time, milliseconds] = timePart.split('.');
    const [hours, minutes, seconds] = time.split(':').map(Number);

    // Create a new Date object using the parsed parts
    return new Date(
      Date.UTC(
        year,
        month - 1,
        day,
        hours,
        minutes,
        seconds,
        Number(milliseconds),
      ),
    ).toLocaleString();
  } catch {
    return dateString;
  }
}

let update: Update | undefined;

const UpdateDialog = NiceModal.create(() => {
  const [newest, setNewest] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [newVersion, setNewVersion] = useState<{
    version: string;
    date?: string;
    body?: string;
  } | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{
    contentLength: number;
    downloaded: number;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [needsRestart, setNeedsRestart] = useState(false);
  const [error, setError] = useState('');
  const modal = useModal();

  const handleCheckUpdates = useCallback(async () => {
    setError('');
    setIsChecking(true);
    try {
      const version = await getVersion();
      setCurrentVersion(version);
      const newVersion = await check();
      if (newVersion) {
        update = newVersion;
        setUpdateAvailable(true);
        setNewVersion({
          version: update.version,
          date: update.date,
          body: update.body,
        });
      } else {
        setNewest(true);
        setUpdateAvailable(false);
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError('Failed to check for updates. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    handleCheckUpdates();
  }, [handleCheckUpdates]);

  const handleDownload = async () => {
    if (!update) return;
    setError('');
    setIsDownloading(true);
    try {
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            setDownloadProgress({
              contentLength: event.data.contentLength ?? 0,
              downloaded: 0,
            });
            break;
          case 'Progress':
            setDownloadProgress((prev) => ({
              contentLength: prev?.contentLength || 0,
              downloaded: (prev?.downloaded || 0) + event.data.chunkLength,
            }));
            break;
          case 'Finished':
            setDownloadProgress(null);
            break;
        }
      });
      setNeedsRestart(true);
    } catch (err) {
      setError('Download failed. Please check your connection and try again.');
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRestart = async () => {
    await relaunch();
  };
  const released = newVersion?.date ? formatDate(newVersion?.date) : '';

  return (
    <Dialog open={modal.visible} onOpenChange={modal.hide}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Application Updates</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm">Current Version: {currentVersion}</p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!updateAvailable && (
            <div className="space-y-2">
              <Button
                onClick={handleCheckUpdates}
                disabled={isChecking}
                className="w-full"
              >
                {isChecking ? 'Checking...' : 'Check for Updates'}
              </Button>
              <div className="h-5">
                {!isChecking && !updateAvailable && (
                  <p className="text-sm text-muted-foreground">
                    {newest ? "You're up to date!" : ' '}
                  </p>
                )}
              </div>
            </div>
          )}

          {updateAvailable && newVersion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">New Version Available</h3>
                <p className="text-sm">
                  Version: {newVersion.version}
                  <br />
                  Released: {released}
                </p>
                <p className="text-sm text-muted-foreground">
                  {newVersion.body}
                </p>
              </div>

              {!needsRestart && (
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full"
                >
                  {isDownloading ? 'Downloading...' : 'Download and Install'}
                </Button>
              )}
            </div>
          )}

          {isDownloading && downloadProgress && (
            <div className="space-y-2">
              <Progress
                value={
                  (downloadProgress.downloaded /
                    downloadProgress.contentLength) *
                  100
                }
              />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(
                  (downloadProgress.downloaded /
                    downloadProgress.contentLength) *
                    100,
                )}
                % Downloaded
              </p>
            </div>
          )}

          {needsRestart && (
            <div className="space-y-2">
              <p className="text-sm text-center">
                Update installed successfully! Please restart the application.
              </p>
              <Button onClick={handleRestart} className="w-full">
                Restart Now
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default UpdateDialog;
