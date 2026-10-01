import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Shield, AlertCircle, Info, X } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, adminAccount } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(username.trim(), password.trim());
    if (res.success) {
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 border-b border-red-900 text-center relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-full bg-red-950 border border-red-700 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-sm">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] text-amber-400 uppercase font-bold tracking-widest block">
            Cổng Phân Quyền Hệ Thống
          </span>
          <h2 className="text-lg font-bold font-serif-doc text-white mt-1">
            Đăng Nhập Quản Trị Viên (Admin)
          </h2>
          <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto leading-relaxed">
            Dành riêng cho Quản trị viên để thực hiện quyền bổ sung, chỉnh sửa hoặc xóa dữ liệu hệ thống.
          </p>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4 text-xs">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tài khoản Quản trị viên:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản admin"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Mật khẩu:
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-red-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors mt-2"
            >
              Đăng nhập quyền Quản trị (Admin)
            </button>
          </form>

          {/* Institutional note on role separation */}
          <div className="pt-3 border-t border-stone-200">
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-stone-800 text-[11px]">
                <Info className="w-3.5 h-3.5 text-red-800" />
                <span>Quy định phân quyền truy cập:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-stone-600">
                Thành viên, chiến sĩ học tập và tra cứu tự do không cần tài khoản và không có quyền bổ sung hay xóa nội dung. Chỉ Quản trị viên (Admin) đăng nhập mới được cấp quyền biên tập và quản lý dữ liệu.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
