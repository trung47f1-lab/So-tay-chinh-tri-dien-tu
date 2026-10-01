export type LoaiTaiLieu = 
  | 'van_kien' 
  | 'chi_thi' 
  | 'phap_luat' 
  | 'giao_duc' 
  | 'truyen_thong';

export interface TaiLieu {
  id: string;
  tieu_de: string;
  loai: LoaiTaiLieu;
  chuyen_de_id: string;
  tom_tat: string;
  noi_dung: string;
  tac_gia: string;
  ngay_dang: string;
  so_hieu?: string;
  file_dinh_kem?: string;
  loai_dinh_kem: 'none' | 'audio' | 'video' | 'pdf' | 'image' | 'word';
  media_url?: string;
  thoi_luong_phut?: number;
  so_luot_xem: number;
  ten_tep_goc?: string;
  du_lieu_tep?: string;
  kich_thuoc_tep?: number;
}

export interface ChuyenDe {
  id: string;
  ten: string;
  mo_ta: string;
  bieu_tuong: string;
  so_tai_lieu: number;
  so_cau_hoi: number;
  thu_tu: number;
}

export interface CauHoi {
  id: string;
  chuyen_de_id: string;
  tai_lieu_id?: string;
  noi_dung: string;
  cac_dap_an: string[];
  dap_an_dung: number; // 0, 1, 2, 3
  giai_thich: string;
  muc_do: 'co_ban' | 'nang_cao';
}

export interface DeThi {
  id: string;
  tieu_de: string;
  chuyen_de_id: string; // ID chuyên đề hoặc 'all' (Tất cả chuyên đề)
  so_cau: number;
  thoi_gian_phut: number;
  doi_tuong: string;
  cau_hoi_ids?: string[];
  mo_ta: string;
  ma_de?: string; // Mã đề thi (VD: MĐ-01, MĐ-02,...)
  tu_dong_rut_cau_hoi?: boolean; // Tự động rút ngẫu nhiên từ ngân hàng
  dao_cau_hoi?: boolean;         // Đảo thứ tự câu hỏi khi phát đề
  dao_dap_an?: boolean;          // Đảo thứ tự 4 đáp án A, B, C, D
  chong_gian_lan?: boolean;      // Chống sử dụng AI & gian lận (chặn copy, giám sát chuyển tab)
  xuat_ma_qr?: boolean;          // Tự động xuất mã QR niêm yết
  ngay_tao?: string;
}

export interface ChiTietCauTraLoi {
  cau_hoi_id: string;
  noi_dung_cau_hoi?: string;
  cac_dap_an?: string[];
  da_chon: number;
  dap_an_dung?: number;
  giai_thich?: string;
  dung: boolean;
}

export interface KetQua {
  id: string;
  nguoi_dung_id: string;
  ho_ten: string;
  cap_bac: string;
  chuc_vu?: string;
  don_vi: string;
  de_thi_id: string;
  de_thi_tieu_de: string;
  ma_de?: string;
  diem: number;
  so_cau_dung: number;
  tong_so_cau: number;
  thoi_gian_lam_giay: number;
  so_lan_roi_man_hinh?: number; // Số lần rời màn hình / chuyển tab trong khi thi
  ngay_thi: string;
  chi_tiet: ChiTietCauTraLoi[];
}

export interface NoiDungHangNgay {
  id: string;
  ngay: string; // YYYY-MM-DD or day of week
  tieu_de: string;
  trich_dan: string;
  hoan_canh: string;
  y_nghia: string;
  nguon: string;
  tai_lieu_id?: string;
  audio_url?: string;
}

export interface MocTruyenThong {
  id: string;
  nam: string;
  ngay_thang: string;
  tieu_de: string;
  noi_dung: string;
  y_nghia: string;
  hinh_anh?: string;
  video_url?: string;
  loai_su_kien: 'thanh_lap' | 'chien_cong' | 'danh_hieu' | 'phat_trien';
}

export type VaiTro = 'chien_si' | 'can_bo' | 'quan_tri';

export interface NguoiDung {
  id: string;
  ho_ten: string;
  cap_bac: string;
  chuc_vu: string;
  don_vi: string;
  vai_tro: VaiTro;
  tai_khoan: string;
  mat_khau_bam?: string;
  dang_nhap_cuoi?: string;
}

export type LoaiQRCode = 'chuyen_de' | 'tai_lieu' | 'de_thi' | 'cau_hoi_tuan';

export interface QRCodeItem {
  id: string;
  tieu_de: string;
  loai: LoaiQRCode;
  muc_tieu_id: string;
  ma_dinh_danh: string;
  duong_dan_noi_bo: string;
  vi_tri_dan: string;
  ngay_tao: string;
  luot_quet: number;
}

export interface NhatKyHeThong {
  id: string;
  thoi_gian: string;
  nguoi_thuc_hien: string;
  vai_tro: string;
  hanh_dong: string;
  chi_tiet: string;
}

export interface BaiHatTruyenThong {
  id: string;
  tieu_de: string;
  tac_gia: string;
  the_loai: 'bai_hat' | 'phat_thanh' | 'podcast';
  thoi_luong: string;
  loi_bai_hat?: string;
  audio_url?: string;
  mo_ta: string;
}

export interface VideoTuLieu {
  id: string;
  tieu_de: string;
  the_loai: 'Phim tài liệu' | 'Phóng sự' | 'Bản tin' | 'Phim truyền thống' | string;
  thoi_luong: string;
  mo_ta: string;
  video_url: string;
  thumbnail_url?: string;
  ngay_dang?: string;
}

export interface InfographicKeyPoint {
  id: string;
  order: number;
  title: string;
  desc: string;
  badge?: string;
  iconName?: string;
}

export interface InfographicItem {
  id: string;
  tieu_de: string;
  tieu_de_phu?: string;
  chuyen_de_id?: string;
  loai_nguon: 'chuyen_de' | 'loi_bac_day' | 'tai_lieu' | 'tuy_chinh';
  trich_dan_bac_ho?: {
    cau_noi: string;
    ngay_thang?: string;
    hoan_canh?: string;
    y_nghia?: string;
  };
  khau_hieu_hanh_dong: string;
  cac_diem_chinh: InfographicKeyPoint[];
  phuong_cham_hanh_dong: string[];
  chi_tieu_thi_dua?: string;
  loi_the_danh_du?: string;
  hinh_anh_ai: {
    id: string;
    duong_dan: string;
    ten_hinh_anh: string;
    mo_ta: string;
    tac_gia_ai: string;
    dac_trung: string;
  };
  don_vi_ap_dung?: string;
  ngay_bien_tap: string;
  nguoi_bien_tap?: string;
  cap_bac_nguoi_bien_tap?: string;
  mau_sac: 'do_vang' | 'xanh_quan_doi' | 'do_sam';
  bo_cuc: 'ap_phich_co_dong' | 'infographic_hien_dai' | 'so_tay_bo_tui';
  so_luot_xem?: number;
  qr_code_id?: string;
}

