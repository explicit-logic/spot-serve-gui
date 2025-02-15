import { useModal } from '@ebay/nice-modal-react';
import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useState } from 'react';

import { CircleDot } from 'lucide-react';

import UpdateDialog from '@/components/dialogs/update-dialog';

function Updater() {
  const [version, setVersion] = useState<string>();
  const modal = useModal(UpdateDialog);
  useEffect(() => {
    const init = async () => {
      const ver = await getVersion();
      setVersion(ver);
    };
    init();
  }, []);

  const onClick = () => {
    modal.show();
  };

  return (
    <div className="absolute text-white rounded-r-sm bottom-24 left-0 w-5 bg-indigo-900 z-10">
      <div className="h-full">
        <button
          className="ml-1 w-3 h-3 text-xs color-white"
          type="button"
          title={`Spot Serve v${version}`}
          onClick={onClick}
        >
          <CircleDot strokeWidth="3" className="w-3 h-3" />
        </button>
        <div className="mb-1 ml-0.5 font-light tabular-nums text-xs [writing-mode:vertical-lr]">
          {version}
        </div>
      </div>
    </div>
  );
}

export default Updater;
