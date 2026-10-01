import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BaiHatTruyenThong, VideoTuLieu } from '../types';
import docImage1 from '../assets/images/truyen_thong_quan_doi_1790380045077.jpg';
import docImage2 from '../assets/images/hoc_tap_chien_si_1790380061202.jpg';
import { 
  Play, 
  Pause, 
  Radio, 
  Music, 
  Volume2, 
  Video, 
  FileText, 
  Share2,
  Disc3,
  Sparkles,
  X,
  Clock,
  Film
} from 'lucide-react';

export const MediaSection: React.FC = () => {
  const { 
    baiHat, 
    video,
    currentAudioTrack, 
    isPlayingAudio, 
    playTrack, 
    pauseTrack,
    taiLieu,
    setSelectedTaiLieu
  } = useApp();

  const [activeMediaTab, setActiveMediaTab] = useState<'bai_hat' | 'phat_thanh' | 'video'>('bai_hat');
  const [selectedLyrics, setSelectedLyrics] = useState<BaiHatTruyenThong | null>(baiHat[0] || null);
  const [selectedVideoForPlay, setSelectedVideoForPlay] = useState<VideoTuLieu | null>(null);

  const filteredItems = baiHat.filter(item => {
    if (activeMediaTab === 'bai_hat') return item.the_loai === 'bai_hat';
    if (activeMediaTab === 'phat_thanh') return item.the_loai === 'phat_thanh' || item.the_loai === 'podcast';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Phân hệ 7</span>
              <span aria-hidden="true">·</span>
              <span>Truyền thông đa phương tiện cơ sở</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Đài Phát Thanh & Âm Nhạc Truyền Thống
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl">
              Kho âm thanh, ca khúc cách mạng chính quy và các bản tin phát thanh 5 phút chính trị của đơn vị cơ sở phục vụ đời sống văn hóa tinh thần bộ đội.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center gap-2">
          <button
            onClick={() => setActiveMediaTab('bai_hat')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
              activeMediaTab === 'bai_hat'
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Ca khúc cách mạng Quân đội ({baiHat.filter(b => b.the_loai === 'bai_hat').length})</span>
          </button>

          <button
            onClick={() => setActiveMediaTab('phat_thanh')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
              activeMediaTab === 'phat_thanh'
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Phát thanh chính trị 5 phút</span>
          </button>

          <button
            onClick={() => setActiveMediaTab('video')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors ${
              activeMediaTab === 'video'
                ? 'bg-red-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Phim tài liệu & Video</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeMediaTab !== 'video' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Audio Playlist (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs uppercase font-bold text-stone-500 tracking-wider block px-1">
              Danh sách chương trình
            </span>

            {filteredItems.map((track) => {
              const isCurrent = currentAudioTrack?.id === track.id;
              const isPlayingThis = isCurrent && isPlayingAudio;

              return (
                <div
                  key={track.id}
                  onClick={() => {
                    setSelectedLyrics(track);
                    if (isPlayingThis) {
                      pauseTrack();
                    } else {
                      playTrack(track);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-red-50/70 border-red-700/60 shadow-sm ring-1 ring-red-200'
                      : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLyrics(track);
                        if (isPlayingThis) pauseTrack();
                        else playTrack(track);
                      }}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105 ${
                        isPlayingThis
                          ? 'bg-red-800 text-white animate-pulse'
                          : 'bg-stone-900 text-white'
                      }`}
                    >
                      {isPlayingThis ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div>
                      <h4 className="text-sm font-bold text-stone-900 font-serif-doc">
                        {track.tieu_de}
                      </h4>
                      <p className="text-xs text-stone-500">
                        {track.tac_gia} · {track.thoi_luong}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLyrics(track);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-600 hover:bg-stone-50"
                  >
                    Xem lời
                  </button>
                </div>
              );
            })}
          </div>

          {/* Lyrics / Broadcast Transcript Panel (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex flex-col justify-between">
            {selectedLyrics ? (
              <div className="space-y-4">
                <div className="border-b border-stone-200 pb-3">
                  <span className="text-[11px] uppercase font-bold text-red-800 tracking-wider">
                    {selectedLyrics.the_loai === 'bai_hat' ? 'Lời bài hát truyền thống' : 'Bản thảo phát thanh'}
                  </span>
                  <h3 className="text-lg font-bold font-serif-doc text-stone-900 mt-1">
                    {selectedLyrics.tieu_de}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Tác giả: {selectedLyrics.tac_gia}
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs sm:text-sm text-stone-800 font-serif-doc whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto">
                  {selectedLyrics.loi_bai_hat}
                </div>

                <div className="pt-2 text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">Ý nghĩa: </span>
                  {selectedLyrics.mo_ta}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-stone-400">
                <Disc3 className="w-12 h-12 mx-auto mb-2 animate-spin-slow" />
                <p className="text-xs">Chọn một bài hát hoặc bản tin để xem lời</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Video Section */
        <div>
          {video.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
              <Film className="w-12 h-12 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">Chưa có video tư liệu nào</p>
              <p className="text-xs text-stone-500 mt-1">Cán bộ quản trị có thể thêm mới video trong Bảng Quản trị.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {video.map((item, index) => {
                // Pick thumbnail fallback
                const fallbackImg = index % 2 === 0 ? docImage1 : docImage2;
                const thumbSrc = item.thumbnail_url?.trim() ? item.thumbnail_url : fallbackImg;
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => setSelectedVideoForPlay(item)}
                    className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-52 bg-stone-900 flex items-center justify-center overflow-hidden">
                        <img
                          src={thumbSrc}
                          alt=""
                          aria-hidden="true"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                          className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4 justify-between">
                          <button 
                            type="button"
                            className="w-12 h-12 rounded-full bg-red-800 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-700 transition-all"
                          >
                            <Play className="w-6 h-6 ml-0.5" />
                          </button>
                          <span className="text-[11px] font-mono text-stone-200 bg-stone-950/80 px-2 py-0.5 rounded border border-stone-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {item.thoi_luong}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <span className="text-[10px] uppercase font-bold text-red-800 tracking-wider">
                          {item.the_loai}
                        </span>
                        <h3 className="text-base font-bold font-serif-doc text-stone-900 mt-1 group-hover:text-red-800 transition-colors line-clamp-2">
                          {item.tieu_de}
                        </h3>
                        <p className="text-xs text-stone-600 mt-1.5 leading-relaxed line-clamp-3">
                          {item.mo_ta}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                      <span>{item.ngay_dang || 'Tư liệu nội bộ'}</span>
                      <span className="text-red-800 font-semibold group-hover:underline">Xem video →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Video Playback Modal */}
      {selectedVideoForPlay && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 text-white border border-stone-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/60">
                  {selectedVideoForPlay.the_loai}
                </span>
                <h3 className="text-sm sm:text-base font-bold font-serif-doc text-white truncate max-w-md">
                  {selectedVideoForPlay.tieu_de}
                </h3>
              </div>
              <button
                onClick={() => setSelectedVideoForPlay(null)}
                className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center">
              {selectedVideoForPlay.video_url.includes('youtube.com') || selectedVideoForPlay.video_url.includes('youtu.be') ? (
                <iframe
                  src={
                    selectedVideoForPlay.video_url.includes('watch?v=')
                      ? selectedVideoForPlay.video_url.replace('watch?v=', 'embed/')
                      : selectedVideoForPlay.video_url
                  }
                  title={selectedVideoForPlay.tieu_de}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={selectedVideoForPlay.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Trình duyệt không hỗ trợ thẻ video.
                </video>
              )}
            </div>

            <div className="p-4 bg-stone-900 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span>Thời lượng: <strong className="text-white">{selectedVideoForPlay.thoi_luong}</strong></span>
                <span>Ngày đăng: <strong className="text-white">{selectedVideoForPlay.ngay_dang || 'Lưu trữ'}</strong></span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedVideoForPlay.mo_ta}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
