import React from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, Square, Music, Volume2, X } from 'lucide-react';

export const AudioPlayerBar: React.FC = () => {
  const { 
    currentAudioTrack, 
    isPlayingAudio, 
    playTrack, 
    pauseTrack, 
    stopAudio,
    isSpeaking,
    speakingTitle,
    stopSpeaking
  } = useApp();

  if (!currentAudioTrack && !isSpeaking) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-md border-t border-red-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Track / Speech Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-red-900 flex items-center justify-center shrink-0 text-amber-300">
            {isSpeaking ? <Volume2 className="w-5 h-5 animate-pulse" /> : <Music className="w-5 h-5" />}
          </div>

          <div className="truncate">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              {isSpeaking ? 'Đang phát âm thanh chính trị (TTS)' : 'Đang phát ca khúc truyền thống'}
            </span>
            <span className="text-xs font-semibold text-stone-100 truncate block font-serif-doc">
              {isSpeaking ? speakingTitle : currentAudioTrack?.tieu_de}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={stopSpeaking}
              className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Dừng đọc</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => isPlayingAudio ? pauseTrack() : currentAudioTrack && playTrack(currentAudioTrack)}
                className="p-2 rounded-full bg-white text-stone-950 hover:bg-amber-400 transition-colors shadow-sm"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                onClick={stopAudio}
                className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
                title="Dừng phát"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
