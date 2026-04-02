import React from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface NetworkStatusProps {
  isOnline: boolean;
  swRegistered: boolean;
  updateAvailable: boolean;
  onUpdate: () => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isOnline,
  swRegistered,
  updateAvailable,
  onUpdate,
}) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-50">
      <div
        className={`
        flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5
        border ${isOnline ? "border-green-500/50" : "border-orange-500/50"}
      `}
      >
        {isOnline ? (
          <Wifi size={14} className="text-green-400" />
        ) : (
          <WifiOff size={14} className="text-orange-400" />
        )}
        {swRegistered && (
          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {updateAvailable && (
        <button
          onClick={onUpdate}
          className="flex items-center gap-1 bg-orange-600/80 backdrop-blur-md text-white 
                     px-3 py-1.5 rounded-full hover:bg-orange-600 transition-all 
                     duration-200 text-xs"
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
};
