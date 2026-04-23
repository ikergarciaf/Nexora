import React, { useRef, useState, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneCall, Users, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function TelemedicineRoom({ isDarkMode, onEndCall, appointmentInfo }: { isDarkMode: boolean, onEndCall: () => void, appointmentInfo?: any }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Join immediately when mounted
  useEffect(() => {
    startLocalStream();
    return () => {
      stopLocalStream();
    };
  }, []);

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setIsJoined(true);

      // Simulate remote patient joining after 6 seconds
      setTimeout(() => {
        setRemoteJoined(true);
      }, 6000);

    } catch (error) {
      console.error("Error accessing media devices.", error);
      alert("Error al acceder a la cámara o micrófono. Por favor, asegúrate de haber dado los permisos.");
    }
  };

  const stopLocalStream = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (remoteJoined) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [remoteJoined]);

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = isMicMuted);
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(t => t.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleLeave = () => {
    stopLocalStream();
    onEndCall();
  };

  return (
    <div className={`flex flex-col h-full rounded-[12px] border overflow-hidden ${isDarkMode ? 'bg-[#0f172a] border-[#334155]' : 'bg-[#1a1f36] border-[#1a1f36]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 text-[12px] font-bold uppercase tracking-wide rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> E2E Encriptado
          </div>
          <span className="text-[14px] font-medium opacity-80">
            {appointmentInfo ? `Consulta: ${appointmentInfo.patientName}` : 'Videoconsulta General'}
          </span>
        </div>
        <div className="flex items-center gap-6 text-[13px] font-medium opacity-80">
          <span className="flex items-center gap-2"><Clock className="w-4 h-4"/> {remoteJoined ? formatTime(callDuration) : 'Esperando paciente...'}</span>
          <span className="flex items-center gap-2"><Users className="w-4 h-4"/> {remoteJoined ? '2' : '1'} en sala</span>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative bg-[#000000] flex items-center justify-center p-4">
        {/* Remote Video (Mocked as blank or connecting) */}
        {!remoteJoined ? (
           <div className="flex flex-col items-center justify-center text-gray-500 gap-4">
              <div className="relative">
                 <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                    <User className="w-10 h-10 opacity-50" />
                 </div>
                 <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full border-[3px] border-black bg-amber-500"></span>
              </div>
              <p className="text-[15px] font-medium">Esperando a que el paciente se conecte...</p>
           </div>
        ) : (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="w-full h-full flex flex-col items-center justify-center"
           >
              {/* Fake remote video - just a gradient backdrop to simulate remote stream missing camera */}
              <div className="w-full h-full max-w-4xl max-h-[60vh] bg-gradient-to-tr from-gray-900 to-gray-800 rounded-xl flex flex-col items-center justify-center border border-gray-800 relative overflow-hidden shadow-2xl">
                 <div className="w-32 h-32 rounded-full bg-gray-700/50 flex items-center justify-center backdrop-blur-md mb-6">
                    <span className="text-white text-4xl font-bold">{appointmentInfo?.patientName?.charAt(0) || 'P'}</span>
                 </div>
                 <h2 className="text-white text-xl font-medium">{appointmentInfo?.patientName || 'Paciente Conectado'}</h2>
                 <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-medium">
                   Señal de red estable
                 </div>
              </div>
           </motion.div>
        )}

        {/* Local Video - picture in picture */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-6 right-6 w-48 lg:w-64 aspect-video bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl z-20"
        >
          <video 
            ref={localVideoRef} 
            autoPlay 
            playsInline 
            muted 
            className={`w-full h-full object-cover transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
               <VideoOff className="w-8 h-8 text-gray-500" />
            </div>
          )}
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-[10px] font-medium backdrop-blur-md">
            Tú (Doctor)
          </div>
        </motion.div>
      </div>

      {/* Controls Footer */}
      <div className="bg-black/90 px-6 py-5 flex items-center justify-center gap-6 z-10">
        <button 
          onClick={toggleMic}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isMicMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          {isMicMuted ? <MicOff className="w-5 h-5"/> : <Mic className="w-5 h-5"/>}
        </button>
        <button 
          onClick={toggleVideo}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          {isVideoOff ? <VideoOff className="w-5 h-5"/> : <Video className="w-5 h-5"/>}
        </button>
        <div className="w-px h-8 bg-gray-800 mx-2"></div>
        <button 
          onClick={handleLeave}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-[14px] font-bold rounded-full transition-colors shadow-lg shadow-red-600/20"
        >
          <PhoneCall className="w-4 h-4 rotate-[135deg]"/> Finalizar
        </button>
      </div>
    </div>
  );
}
