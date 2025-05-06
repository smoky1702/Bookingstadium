import { 
  faFutbol, 
  faBasketballBall, 
  faVolleyballBall, 
  faTableTennis, 
  faGolfBall, 
  faSwimmingPool, 
  faRunning, 
  faBiking, 
  faHockeyPuck, 
  faBaseballBall, 
  faFootballBall, 
  faDumbbell,
  faMountain,
  faSnowboarding,
  faSkiing,
  faHiking,
  faFistRaised,
  faTrophy,
  faShieldAlt,
  faMedal
} from '@fortawesome/free-solid-svg-icons';

// Khóa lưu trữ trong localStorage
const STORAGE_KEY = 'typeStyleSettings';

// Mảng các icon có sẵn
export const availableIcons = [
  { name: 'Bóng đá', icon: faFutbol },
  { name: 'Bóng rổ', icon: faBasketballBall },
  { name: 'Bóng chuyền', icon: faVolleyballBall },
  { name: 'Cầu lông', icon: faTableTennis },
  { name: 'Golf', icon: faGolfBall },
  { name: 'Bơi lội', icon: faSwimmingPool },
  { name: 'Chạy bộ', icon: faRunning },
  { name: 'Đạp xe', icon: faBiking },
  { name: 'Hockey', icon: faHockeyPuck },
  { name: 'Bóng chày', icon: faBaseballBall },
  { name: 'Bóng bầu dục', icon: faFootballBall },
  { name: 'Gym', icon: faDumbbell },
  { name: 'Leo núi', icon: faMountain },
  { name: 'Trượt ván', icon: faSnowboarding },
  { name: 'Trượt tuyết', icon: faSkiing },
  { name: 'Đi bộ đường dài', icon: faHiking },
  { name: 'Võ thuật', icon: faFistRaised },
  { name: 'Giải đấu', icon: faTrophy },
  { name: 'Phòng thủ', icon: faShieldAlt },
  { name: 'Huy chương', icon: faMedal }
];

// Mảng các màu có sẵn
export const availableColors = [
  { name: 'Xanh lá', color: '#28a745' },
  { name: 'Cam', color: '#fd7e14' },
  { name: 'Đỏ', color: '#dc3545' },
  { name: 'Tím', color: '#6f42c1' },
  { name: 'Xanh dương', color: '#1a4297' },
  { name: 'Vàng', color: '#ffc107' },
  { name: 'Hồng', color: '#e83e8c' },
  { name: 'Lam', color: '#17a2b8' },
  { name: 'Đen', color: '#343a40' },
  { name: 'Trắng', color: '#f8f9fa' },
  { name: 'Xám', color: '#6c757d' },
  { name: 'Xanh lá nhạt', color: '#75b798' },
  { name: 'Xanh dương nhạt', color: '#6ea8fe' },
  { name: 'Cam nhạt', color: '#ffb866' },
  { name: 'Đỏ nhạt', color: '#ea868f' },
  { name: 'Tím nhạt', color: '#a98eda' }
];

// Hàm lấy typeStyleSettings từ localStorage
export const getTypeStyleSettings = () => {
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    return savedSettings ? JSON.parse(savedSettings) : {};
  } catch (e) {
    console.error("Lỗi khi đọc cài đặt từ localStorage:", e);
    return {};
  }
};

// Hàm lưu typeStyleSettings vào localStorage
export const saveTypeStyleSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    
    // Phát ra event để thông báo cho các component trong cùng tab
    window.dispatchEvent(new CustomEvent('typeSettingsChanged', { 
      detail: { settings }
    }));
  } catch (e) {
    console.error("Lỗi khi lưu cài đặt vào localStorage:", e);
  }
};

// Các màu mặc định theo tên loại sân
const defaultColors = {
  'bóng đá': "#28a745",  // Xanh lá
  'bóng rổ': "#fd7e14",  // Cam
  'bóng chuyền': "#dc3545", // Đỏ
  'cầu lông': "#6f42c1",   // Tím
  'default': "#1a4297"     // Xanh dương (mặc định)
};

// Các icon mặc định theo tên loại sân
const defaultIcons = {
  'bóng đá': faFutbol,
  'bóng rổ': faBasketballBall,
  'bóng chuyền': faVolleyballBall,
  'cầu lông': faTableTennis,
  'default': faFutbol
};

// Tìm icon mặc định dựa trên tên loại sân
const findDefaultIconForType = (typeName) => {
  if (!typeName) return defaultIcons.default;
  
  const name = typeName.toLowerCase();
  
  for (const key in defaultIcons) {
    if (name.includes(key)) {
      return defaultIcons[key];
    }
  }
  
  return defaultIcons.default;
};

// Tìm màu mặc định dựa trên tên loại sân
const findDefaultColorForType = (typeName) => {
  if (!typeName) return defaultColors.default;
  
  const name = typeName.toLowerCase();
  
  for (const key in defaultColors) {
    if (name.includes(key)) {
      return defaultColors[key];
    }
  }
  
  return defaultColors.default;
};

// Hàm lấy icon dựa vào tên loại sân
export const getTypeIcon = (typeName) => {
  if (!typeName) return defaultIcons.default;
  
  // Đọc cài đặt từ localStorage
  const settings = getTypeStyleSettings();
  
  // Nếu có cài đặt tùy chỉnh cho loại sân này
  if (settings[typeName] && settings[typeName].iconName) {
    const iconConfig = availableIcons.find(item => item.name === settings[typeName].iconName);
    if (iconConfig) return iconConfig.icon;
  }
  
  // Nếu không có cài đặt, dùng logic mặc định
  return findDefaultIconForType(typeName);
};

// Hàm lấy màu dựa vào tên loại sân
export const getTypeColor = (typeName) => {
  if (!typeName) return defaultColors.default;
  
  // Đọc cài đặt từ localStorage
  const settings = getTypeStyleSettings();
  
  // Nếu có cài đặt tùy chỉnh cho loại sân này
  if (settings[typeName] && settings[typeName].color) {
    return settings[typeName].color;
  }
  
  // Nếu không có cài đặt, dùng logic mặc định
  return findDefaultColorForType(typeName);
}; 