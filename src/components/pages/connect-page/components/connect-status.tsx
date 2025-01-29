import { Badge } from '@/components/ui/badge';
import { STATES } from '@/constants/connection';
import { useConnection } from '@/hooks/use-connection';
import { Link } from 'lucide-react';

export default function ConnectStatus() {
  const { activeCount, state } = useConnection();

  if (state === STATES.ONLINE) {
    return (
      <Badge variant="outline" className="flex items-center">
        <div className="flex relative h-1.5 w-1.5 mr-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500" />
        </div>
        {activeCount > 0 ? (
          <div className="flex items-center">
            <Link className="w-2 h-2 mr-1" />
            <span>{activeCount}</span>
          </div>
        ) : (
          <span>Online</span>
        )}
      </Badge>
    );
  }

  if (state === STATES.ERROR) {
    return (
      <Badge variant="outline" className="flex items-center">
        <span className="inline-flex rounded-full h-1.5 w-1.5 bg-red-500 mr-2" />
        <span>Error</span>
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center">
      <span className="inline-flex rounded-full h-1.5 w-1.5 bg-gray-500 mr-2" />
      <span className="text-gray-400">Offline</span>
    </Badge>
  );
}
