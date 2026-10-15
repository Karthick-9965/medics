import React, { createContext, useContext, useState } from 'react';
import AudioCallModal from '../components/consultation/AudioCallModal';
import VideoCallModal from '../components/consultation/VideoCallModal';
import ActiveCallFloatingBar from '../components/consultation/ActiveCallFloatingBar';
import { resetGlobalCallTimer } from '../hooks/useCallTimer';

export interface ActiveCall {
  type: 'audio' | 'video';
  doctor: any;
}

export interface CallContextType {
  activeCall: ActiveCall | null;
  isMinimized: boolean;
  startCall: (type: 'audio' | 'video', doctor: any) => void;
  endCall: () => void;
  minimizeCall: () => void;
  maximizeCall: () => void;
  switchToVideo: () => void;
  switchToAudio: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const startCall = (type: 'audio' | 'video', doctor: any) => {
    setActiveCall({ type, doctor });
    setIsMinimized(false);
  };

  const endCall = () => {
    resetGlobalCallTimer();
    setActiveCall(null);
    setIsMinimized(false);
    setIsMuted(false);
  };

  const minimizeCall = () => {
    setIsMinimized(true);
  };

  const maximizeCall = () => {
    setIsMinimized(false);
  };

  const switchToVideo = () => {
    setActiveCall((prev) => (prev ? { ...prev, type: 'video' } : null));
    setIsMinimized(false);
  };

  const switchToAudio = () => {
    setActiveCall((prev) => (prev ? { ...prev, type: 'audio' } : null));
    setIsMinimized(false);
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        isMinimized,
        startCall,
        endCall,
        minimizeCall,
        maximizeCall,
        switchToVideo,
        switchToAudio,
      }}
    >
      {children}

      {/* Floating Active Call Banner when Minimized */}
      {activeCall && isMinimized && (
        <ActiveCallFloatingBar
          call={activeCall}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted((m) => !m)}
          onExpand={maximizeCall}
          onEnd={endCall}
        />
      )}

      {/* Full-screen Audio Call Modal */}
      {activeCall && !isMinimized && activeCall.type === 'audio' && (
        <AudioCallModal
          visible={true}
          doctor={activeCall.doctor}
          onEndCall={endCall}
          onClose={endCall}
          onSwitchToVideo={switchToVideo}
          onMinimize={minimizeCall}
        />
      )}

      {/* Full-screen Video Call Modal */}
      {activeCall && !isMinimized && activeCall.type === 'video' && (
        <VideoCallModal
          visible={true}
          doctor={activeCall.doctor}
          onEndCall={endCall}
          onClose={endCall}
          onSwitchToAudio={switchToAudio}
          onMinimize={minimizeCall}
        />
      )}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
