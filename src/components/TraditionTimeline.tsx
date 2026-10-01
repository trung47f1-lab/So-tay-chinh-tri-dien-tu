import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Shield, 
  Award, 
  Calendar, 
  Flag, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  Clock, 
  Image as ImageIcon,
  LogIn
} from 'lucide-react';
import { MocTruyenThong } from '../types';

export const TraditionTimeline: React.FC = () => {
  const { 
    mocTruyenThong, 
    setCurrentTab, 
    setActiveChuyenDeId,
    currentUser,
    setIsLoginModalOpen,
    addMocTruyenThong,
    updateMocTruyenThong,
    deleteMocTruyenThong
  } = useApp();

  const isAdmin = currentUser.vai_tro === 'quan_tri';

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<MocTruyenThong | null>(null);

  // Form Fields
  const [nam, setNam] = useState('');
  const [ngayThang, setNgayThang] = useState('');
  const [tieuDe, setTieuDe] = useState('');
  const [loaiSuKien, setLoaiSuKien] = useState<'thanh_lap' | 'chien_cong' | 'danh_hieu' | 'phat_trien'>('chien_cong');
  const [noiDung, setNoiDung] = useState('');
  const [yNghia, setYNghia] = useState('');
  const [hinhAnh, setHinhAnh] = useState('');
  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingMilestone(null);
    setNam('');
    setNgayThang('');
    setTieuDe('');
    setLoaiSuKien('chien_cong');
    setNoiDung('');
    setYNghia('');
    setHinhAnh('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: MocTruyenThong) => {
    setEditingMilestone(item);
    setNam(item.nam);
    setNgayThang(item.ngay_thang);
    setTieuDe(item.tieu_de);
    setLoaiSuKien(item.loai_su_kien);
    setNoiDung(item.noi_dung);
    setYNghia(item.y_nghia);
    setHinhAnh(item.hinh_anh || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nam.trim() || !ngayThang.trim() || !tieuDe.trim() || !noiDung.trim()) {
      setFormError('Vui lòng điền đầy đủ: Năm, Ngày tháng, Tiêu đề và Nội dung tóm tắt.');
      return;
    }

    if (editingMilestone) {
      updateMocTruyenThong({
        ...editingMilestone,
        nam: nam.trim(),
        ngay_thang: ngayThang.trim(),
        tieu_de: tieuDe.trim(),
        loai_su_kien: loaiSuKien,
        noi_dung: noiDung.trim(),
        y_nghia: yNghia.trim(),
        hinh_anh: hinhAnh.trim() ? hinhAnh.trim() : undefined
      });
    } else {
      addMocTruyenThong({
        nam: nam.trim(),
        ngay_thang: ngayThang.trim(),
        tieu_de: tieuDe.trim(),
        loai_su_kien: loaiSuKien,
        noi_dung: noiDung.trim(),
        y_nghia: yNghia.trim(),
        hinh_anh: hinhAnh.trim() ? hinhAnh.trim() : undefined
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Đồng chí có chắc chắn muốn xóa mốc lịch sử "${title}" không?`)) {
      deleteMocTruyenThong(id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tradition Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-red-800 font-bold uppercase tracking-wider mb-1">
              <span>Phân hệ 6</span>
              <span aria-hidden="true">·</span>
              <span>Lịch sử & Truyền thống hào hùng</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-doc text-stone-900">
              Dòng Thời Gian Lịch Sử & Truyền Thống Đơn Vị
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
              Tập hợp các mốc son lịch sử, ngày truyền thống, chiến công hiển hách và những phần thưởng cao quý của đơn vị qua các thời kỳ. Nguồn sử liệu số phục vụ giáo dục truyền thống chính quy và bồi dưỡng niềm tự hào cho cán bộ, chiến sĩ.
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-stone-100 text-xs">
              <div className="flex items-center gap-1.5 text-stone-700">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="font-semibold">Truyền thống vẻ vang</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <Shield className="w-4 h-4 text-red-700" />
                <span className="font-semibold">Kỷ luật & Trung dũng</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-700">
                <Flag className="w-4 h-4 text-emerald-700" />
                <span className="font-semibold">Quyết chiến Quyết thắng</span>
              </div>
            </div>
          </div>

          {/* Action Button for Admins */}
          {isAdmin && (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={openAddModal}
                className="px-4 py-3 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Bổ sung mốc truyền thống</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* When Empty: Dignified Official Prompt */}
      {mocTruyenThong.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-stone-300 p-8 sm:p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-serif-doc text-stone-900 mb-2">
            Chưa Có Mốc Lịch Sử — Truyền Thống Nào Được Ghi Nhận
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed mb-6">
            Dữ liệu dòng thời gian lịch sử đang sẵn sàng để Quản trị viên cập nhật theo các mốc son truyền thống thực tế của đơn vị. Thành viên xem nội dung không có quyền bổ sung hay xóa dữ liệu.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {isAdmin ? (
              <button
                onClick={openAddModal}
                className="px-5 py-2.5 bg-red-800 hover:bg-red-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>Nhập mốc lịch sử truyền thống đầu tiên</span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                <LogIn className="w-4 h-4 text-amber-300" />
                <span>Đăng nhập Quản trị viên để bổ sung nội dung</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveChuyenDeId('cd-5');
                setCurrentTab('kho_tai_lieu');
              }}
              className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-stone-600" />
              <span>Xem tài liệu truyền thống trong Kho</span>
            </button>
          </div>
        </div>
      ) : (
        /* Historical Timeline Container */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-red-800/40 space-y-10 my-8 ml-4 sm:ml-6">
          {mocTruyenThong.map((item) => (
            <div key={item.id} className="relative group">
              
              {/* Timeline node icon */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full bg-red-800 text-amber-300 border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-md group-hover:scale-110 transition-transform">
                ★
              </div>

              {/* Event Card */}
              <div className="bg-white rounded-2xl border border-stone-200 hover:border-red-700/60 p-6 shadow-sm hover:shadow-md transition-all">
                
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold font-serif-doc text-red-800 font-mono">
                      {item.nam}
                    </span>
                    <span className="text-xs text-stone-400" aria-hidden="true">·</span>
                    <span className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      {item.ngay_thang}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      item.loai_su_kien === 'chien_cong' ? 'bg-red-50 text-red-800 border border-red-200' :
                      item.loai_su_kien === 'thanh_lap' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      item.loai_su_kien === 'danh_hieu' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {item.loai_su_kien === 'chien_cong' ? 'Chiến công hiển hách' :
                       item.loai_su_kien === 'thanh_lap' ? 'Ngày thành lập' :
                       item.loai_su_kien === 'danh_hieu' ? 'Phần thưởng cao quý' : 'Phát triển chính quy'}
                    </span>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="flex items-center gap-1 ml-2 border-l border-stone-200 pl-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-stone-500 hover:text-red-700 hover:bg-stone-100 rounded transition-colors"
                          title="Sửa thông tin mốc lịch sử"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.tieu_de)}
                          className="p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa mốc này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold font-serif-doc text-stone-900 mb-2">
                  {item.tieu_de}
                </h3>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4 whitespace-pre-line">
                  {item.noi_dung}
                </p>

                {/* Historical Photo if available */}
                {item.hinh_anh && (
                  <div className="rounded-xl overflow-hidden border border-stone-200 mb-4 shadow-inner max-h-72">
                    <img
                      src={item.hinh_anh}
                      alt={item.tieu_de}
                      referrerPolicy="no-referrer"
                      className="w-full h-48 sm:h-64 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}

                {/* Significance Box */}
                {item.y_nghia && (
                  <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/80 text-xs text-stone-700 leading-relaxed">
                    <span className="font-bold text-red-800 block mb-1">
                      Giá trị & Bài học kinh nghiệm:
                    </span>
                    <p>{item.y_nghia}</p>
                  </div>
                )}

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Footer Navigation CTA */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 sm:p-8 border border-red-900 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
            Tìm hiểu sâu hơn về truyền thống vẻ vang
          </span>
          <h3 className="text-lg font-bold font-serif-doc text-white mt-1">
            Chuyên đề Lịch sử & Truyền thống Đơn vị
          </h3>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Toàn bộ các tư liệu lịch sử, bài giảng chính trị và các bài hát truyền thống quân đội được lưu trữ đầy đủ trong Kho tài liệu.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveChuyenDeId('cd-5');
            setCurrentTab('kho_tai_lieu');
          }}
          className="px-5 py-2.5 bg-red-800 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 whitespace-nowrap shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>Mở chuyên đề truyền thống</span>
        </button>
      </div>

      {/* Modal: Thêm / Sửa Mốc Truyền Thống */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-red-900 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-800 flex items-center justify-center text-amber-300 font-bold text-xs">
                  ★
                </div>
                <h2 className="text-base font-bold font-serif-doc">
                  {editingMilestone ? 'Cập Nhật Mốc Lịch Sử Truyền Thống' : 'Bổ Sung Mốc Truyền Thống Mới'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Năm sự kiện <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 1945, 1975, 2026..."
                    value={nam}
                    onChange={(e) => setNam(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ngày tháng <span className="text-red-700">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 22/12/1944 hoặc Ngày/Tháng"
                    value={ngayThang}
                    onChange={(e) => setNgayThang(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Loại sự kiện:
                </label>
                <select
                  value={loaiSuKien}
                  onChange={(e) => setLoaiSuKien(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800 bg-white"
                >
                  <option value="thanh_lap">Ngày thành lập đơn vị</option>
                  <option value="chien_cong">Chiến công hiển hách</option>
                  <option value="danh_hieu">Phần thưởng, danh hiệu cao quý</option>
                  <option value="phat_trien">Xây dựng & phát triển chính quy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tiêu đề mốc lịch sử <span className="text-red-700">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Thành lập Trung đoàn; Chiến dịch giải phóng..."
                  value={tieuDe}
                  onChange={(e) => setTieuDe(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nội dung tóm tắt sự kiện <span className="text-red-700">*</span>:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tóm tắt bối cảnh, diễn biến, kết quả đạt được..."
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800 resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ý nghĩa lịch sử & Bài học kinh nghiệm:
                </label>
                <textarea
                  rows={2}
                  placeholder="Bài học giáo dục truyền thống cho thế hệ cán bộ, chiến sĩ hôm nay..."
                  value={yNghia}
                  onChange={(e) => setYNghia(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Đường dẫn hình ảnh tư liệu (tùy chọn):
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="https://... hoặc /src/assets/images/..."
                    value={hinhAnh}
                    onChange={(e) => setHinhAnh(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingMilestone ? 'Lưu thay đổi' : 'Thêm mốc lịch sử'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
