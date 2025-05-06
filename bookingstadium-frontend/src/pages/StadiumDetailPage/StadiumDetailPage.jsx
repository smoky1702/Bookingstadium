import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar, faMapMarkerAlt, faTag, faMoneyBillWave, faCheckCircle,
  faTimesCircle, faFutbol, faCalendarAlt, faUser, faCommentAlt,
  faArrowLeft, faLocationArrow, faInfoCircle, faClock,
  faBasketballBall, faVolleyballBall, faTableTennis, faPhone, faEnvelope, faHome
} from '@fortawesome/free-solid-svg-icons';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AuthContext from '../../context/AuthContext';
import { stadiumAPI, locationAPI, typeAPI, imageAPI, bookingAPI, stadiumBookingDetailAPI, billAPI, evaluationAPI, userAPI, workScheduleAPI, goongMapAPI } from '../../services/apiService';
import BookingConfirmModal from '../BookingConfirmModal/BookingConfirmModal';
import GoongMap from '../../components/GoongMap/GoongMap';
import '../StadiumDetailPage/StadiumDetailPage.css';
import { getTypeIcon, getTypeColor, getTypeStyleSettings } from '../../utils/typeStyleUtils';

// Cung cấp giá trị mặc định cho openLoginModal để tránh lỗi nếu không được truyền
const StadiumDetailPage = ({ openLoginModal = () => console.log('openLoginModal not provided') }) => {
  const { stadiumId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);

  const [stadium, setStadium] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stadiumImage, setStadiumImage] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [allBookings, setAllBookings] = useState([]); // Lưu trữ toàn bộ booking
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]); // Lưu trữ khung giờ đã đặt trong ngày được chọn
  const [workSchedule, setWorkSchedule] = useState([]); // Lưu trữ lịch làm việc
  const [currentPage, setCurrentPage] = useState(1); // Thêm state cho trang hiện tại
  const evaluationsPerPage = 4; // Số đánh giá mỗi trang
  const [mapCoordinates, setMapCoordinates] = useState(null); // Thêm state lưu tọa độ cho bản đồ
  const [typeStyleSettings, setTypeStyleSettings] = useState({}); // State lưu cài đặt icon và màu sắc

  // Thêm useEffect để lắng nghe thay đổi trong localStorage và cập nhật cài đặt
  useEffect(() => {
    // Hàm xử lý khi localStorage thay đổi từ tab khác
    const handleStorageChange = () => {
      setTypeStyleSettings(getTypeStyleSettings());
    };
    
    // Hàm xử lý khi cài đặt thay đổi trong cùng tab
    const handleSettingsChange = (event) => {
      setTypeStyleSettings(event.detail.settings || getTypeStyleSettings());
    };

    // Đăng ký lắng nghe sự kiện storage (thay đổi từ tab khác)
    window.addEventListener('storage', handleStorageChange);
    
    // Đăng ký lắng nghe sự kiện tùy chỉnh (thay đổi từ cùng tab)
    window.addEventListener('typeSettingsChanged', handleSettingsChange);
    
    // Đọc cài đặt lần đầu khi component mount
    setTypeStyleSettings(getTypeStyleSettings());
    
    // Cleanup listener khi unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('typeSettingsChanged', handleSettingsChange);
    };
  }, []);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    userId: currentUser?.user_id || '',
    locationId: '',
    dateOfBooking: '',
    startTime: '',
    endTime: '',
  });

  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [timeError, setTimeError] = useState(null);

  // Form đánh giá
  const [evaluationForm, setEvaluationForm] = useState({
    content: '',
    rating: 5,
  });
  const [evaluationError, setEvaluationError] = useState(null);
  const [evaluationSuccess, setEvaluationSuccess] = useState(false);
  
  // Lưu giờ làm việc cho ngày đã chọn
  const [workingHours, setWorkingHours] = useState({ 
    openingHours: "08:00", 
    closingHours: "22:00" 
  });
  
  // Lấy giờ làm việc cho ngày đã chọn
  const getWorkingHoursForSelectedDate = (dateString) => {
    if (!workSchedule || !workSchedule.length || !dateString) {
      return { openingHours: "8:00", closingHours: "22:00" }; // Giá trị mặc định nếu không có dữ liệu
    }
    
    const selectedDate = new Date(dateString);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[selectedDate.getDay()];
    
    // Tìm lịch làm việc cho ngày trong tuần đã chọn
    const scheduleForDay = workSchedule.find(schedule => schedule.dayOfTheWeek === dayOfWeek);
    
    if (scheduleForDay) {
      return {
        openingHours: scheduleForDay.openingHours,
        closingHours: scheduleForDay.closingHours
      };
    }
    
    // Nếu không tìm thấy, trả về giờ mặc định
    return { openingHours: "8:00", closingHours: "22:00" };
  };
  
  // Cập nhật giờ làm việc khi chọn ngày
  useEffect(() => {
    if (bookingData.dateOfBooking) {
      const hours = getWorkingHoursForSelectedDate(bookingData.dateOfBooking);
      setWorkingHours(hours);
    }
  }, [bookingData.dateOfBooking, workSchedule]);

  // Lấy user_id ngay khi trang tải
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUser?.user_id) {
        try {
          const userResponse = await userAPI.getCurrentUser();
          const userId = userResponse.data?.user_id || userResponse.data?.id;
          // Nếu không lấy được user_id, không cần ghi log hoặc hiển thị lỗi
        } catch (error) {
          if (error.response?.status === 401 || error.response?.status === 403) {
            logout();
            if (typeof openLoginModal === 'function') {
              openLoginModal();
            }
          }
        }
      }
    };

    if (isAuthenticated) {
      fetchUserDetails();
    }
  }, [isAuthenticated, currentUser, logout, openLoginModal]);

  // Lấy toàn bộ booking một lần duy nhất khi component mount, nhưng chỉ nếu người dùng đã đăng nhập
  const [bookingCache, setBookingCache] = useState({});
  const isLoadingRef = useRef(false);
  const lastDateRef = useRef(null);

  useEffect(() => {
    const fetchBookingsByDate = async () => {
      // Điều kiện để tránh gọi API không cần thiết
      if (!stadiumId || !bookingData.dateOfBooking || !isAuthenticated) return;
      
      // Nếu đang loading hoặc ngày giống hệt lần cuối, bỏ qua
      if (isLoadingRef.current || bookingData.dateOfBooking === lastDateRef.current) return;
      
      // Nếu dữ liệu đã có trong cache, dùng lại luôn
      if (bookingCache[bookingData.dateOfBooking]) {
        const validBookings = bookingCache[bookingData.dateOfBooking].filter(
          booking => booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );
        setBookedTimeSlots(validBookings);
        return;
      }
      
      try {
        // Đánh dấu đang loading và lưu ngày hiện tại
        isLoadingRef.current = true;
        lastDateRef.current = bookingData.dateOfBooking;
        
        const response = await stadiumAPI.getStadiumBooking(stadiumId, bookingData.dateOfBooking);
        
        const bookings = response.data?.result || response.data || [];
        
        // Lọc các booking có trạng thái CONFIRMED hoặc PENDING
        const validBookings = bookings.filter(
          booking => booking.status === 'CONFIRMED' || booking.status === 'PENDING'
        );
        
        // Lưu vào cache và cập nhật state
        setBookingCache(prev => ({...prev, [bookingData.dateOfBooking]: bookings}));
        setBookedTimeSlots(validBookings);
      } catch (error) {
        // Xử lý lỗi 404 - khung giờ trống
        if (error.response?.status === 404) {
          setBookedTimeSlots([]);
          return;
        }
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          // KHÔNG logout() người dùng, chỉ hiển thị thông báo
          setBookingError('Không thể tải thông tin đặt sân. Vui lòng làm mới trang hoặc đăng nhập lại.');
          setBookedTimeSlots([]);
        } else {
          setBookingError('Không thể tải danh sách đặt sân. Sân có thể còn trống hoặc hệ thống đang gặp sự cố.');
          setBookedTimeSlots([]);
        }
      } finally {
        setTimeout(() => {
          isLoadingRef.current = false;
        }, 300);
      }
    };

    fetchBookingsByDate();
    
    return () => {
      isLoadingRef.current = false;
    };
  }, [stadiumId, bookingData.dateOfBooking, isAuthenticated]);

  // Lấy lịch làm việc
  useEffect(() => {
    const fetchWorkSchedule = async () => {
      if (!stadium || !location) return;
      
      try {
        const response = await workScheduleAPI.getWorkSchedule();
        
        if (response && response.data) {
          let scheduleData = [];
          
          // Kiểm tra các cấu trúc phản hồi có thể có
          if (response.data.result && Array.isArray(response.data.result)) {
            scheduleData = response.data.result;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            scheduleData = response.data.data;
          } else if (Array.isArray(response.data)) {
            scheduleData = response.data;
          }
          
          // Lọc lịch làm việc theo locationId
          const locationIdToMatch = location.locationId || location.id;
          
          const stadiumSchedule = scheduleData.filter(schedule => {
            const scheduleLocationId = schedule.locationId || schedule.location_id;
            return scheduleLocationId == locationIdToMatch;
          });
          
          // Chỉ cần thiết lập trạng thái khi có dữ liệu lịch làm việc từ API
          setWorkSchedule(stadiumSchedule);
        }
      } catch (error) {
        // Không làm gì cả khi không lấy được lịch làm việc - sẽ dùng giờ mặc định
      }
    };
    
    fetchWorkSchedule();
  }, [stadium, location]);

  // Thêm useEffect để lấy tọa độ nếu location không có sẵn lat/lng
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        // Nếu đã có tọa độ trong location
        if (location && location.latitude && location.longitude) {
          console.log('Đã có tọa độ trong dữ liệu location:', location.latitude, location.longitude);
          setMapCoordinates({
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude)
          });
          return;
        }
        
        // Nếu không có location hoặc không có tọa độ, thử lấy từ locationId
        if (location && location.locationId) {
          try {
            console.log('Đang lấy tọa độ từ locationId:', location.locationId);
            // Thử lấy trực tiếp từ backend theo locationId
            const response = await locationAPI.getLocationById(location.locationId);
            
            if (response.data && (response.data.latitude || response.data.result?.latitude)) {
              const locationData = response.data.result || response.data;
              if (locationData.latitude && locationData.longitude) {
                console.log('Đã lấy được tọa độ từ location API:', locationData);
                setMapCoordinates({
                  latitude: parseFloat(locationData.latitude),
                  longitude: parseFloat(locationData.longitude)
                });
                return;
              }
            }
          } catch (error) {
            console.error('Lỗi khi lấy location theo ID:', error);
          }
        }
        
        // Nếu không có tọa độ, thử dùng geocoding với địa chỉ
        const fullAddress = getFullAddress();
        if (!fullAddress || fullAddress === "Đang cập nhật địa chỉ...") {
          console.log('Không có địa chỉ để tìm tọa độ');
          // Không set tọa độ mặc định - để mapCoordinates là null
          return;
        }
        
        console.log('Thử geocoding với địa chỉ:', fullAddress);
        try {
          const response = await goongMapAPI.geocode(fullAddress);
          
          if (response.data && response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            const coordinates = result.geometry?.location;
            
            if (coordinates && coordinates.lat && coordinates.lng) {
              console.log('Đã lấy tọa độ từ geocoding:', coordinates);
              setMapCoordinates({
                latitude: coordinates.lat,
                longitude: coordinates.lng
              });
              
              // Nếu có location nhưng chưa có tọa độ, cố gắng cập nhật tọa độ lên server
              if (location && location.locationId && (location.latitude === null || location.longitude === null)) {
                try {
                  console.log('Cập nhật tọa độ cho location:', location.locationId);
                  await locationAPI.updateLocation(location.locationId, {
                    ...location,
                    latitude: coordinates.lat,
                    longitude: coordinates.lng
                  });
                  console.log('Đã cập nhật tọa độ cho location');
                } catch (updateError) {
                  console.error('Lỗi khi cập nhật tọa độ cho location:', updateError);
                }
              }
            } else {
              console.log('Không tìm thấy tọa độ trong kết quả geocoding');
              // Không set tọa độ mặc định
            }
          } else {
            console.log('Không tìm thấy kết quả geocoding cho địa chỉ:', fullAddress);
            // Không set tọa độ mặc định
          }
        } catch (geocodingError) {
          console.error('Lỗi khi gọi geocoding API:', geocodingError);
          // Không set tọa độ mặc định
        }
      } catch (error) {
        console.error('Lỗi khi lấy tọa độ:', error);
        // Không set tọa độ mặc định
      }
    };
    
    if (location || stadium?.locationId) {
      fetchCoordinates();
    }
  }, [location, stadium]);

  // Thêm hàm để lấy địa chỉ đơn giản hóa
  const getSimplifiedAddress = () => {
    if (!location) return "";
    
    // Chỉ lấy phần district và city cho địa chỉ đơn giản
    const parts = [];
    if (location.district) parts.push(location.district);
    if (location.city) parts.push(location.city);
    if (location.province) parts.push(location.province);
    if (parts.length === 0 && location.address) {
      // Nếu không có district/city, lấy phần cuối của địa chỉ
      const addressParts = location.address.split(',');
      if (addressParts.length > 1) {
        return addressParts[addressParts.length - 1].trim();
      }
      return location.address;
    }
    
    return parts.join(", ");
  };

  // Hàm lấy tên loại sân
  const getTypeName = (typeObj) => {
    if (!typeObj) return "Không xác định";
    return typeObj.typeName || typeObj.type_name || typeObj.name || "Không xác định";
  };

  // Hàm lấy địa chỉ đầy đủ
  const getFullAddress = () => {
    if (!location) return "Đang cập nhật địa chỉ...";
    
    const parts = [];
    if (location.address) parts.push(location.address);
    if (location.ward) parts.push(location.ward);
    if (location.district) parts.push(location.district);
    if (location.city) parts.push(location.city);
    if (location.province && location.province !== location.city) parts.push(location.province);
    
    return parts.join(", ") || "Chưa có thông tin địa chỉ";
  };

  // Lấy giá trị đánh giá (rating)
  const getEvaluationRating = (evaluation) => {
    if (!evaluation) return 0;
    return Number(evaluation.rating || evaluation.ratingScore || evaluation.ratingValue || evaluation.score || evaluation.value || 0) || 0;
  };

  // Lấy nội dung đánh giá
  const getEvaluationContent = (evaluation) => {
    const content = evaluation.content || evaluation.evaluationContent || evaluation.comment || evaluation.text || evaluation.description || evaluation.message;
    if (evaluation.data && typeof evaluation.data === 'object') {
      const dataContent = evaluation.data.content || evaluation.data.evaluationContent || evaluation.data.comment || evaluation.data.text;
      if (dataContent) return dataContent;
    }
    return content || '';
  };

  // Tạo các tùy chọn nhảy 30 phút
  const generateTimeOptions = (startHour, endHour) => {
    const options = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      options.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < endHour) {
        options.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return options;
  };

  // Hàm hiển thị tên người dùng
  const handleUserDisplay = (evaluation) => {
    const userId = evaluation.userId;
    if (userId) {
      const userIdSuffix = userId.slice(-4);
      return `Người dùng ẩn danh ${userIdSuffix}`;
    }
    return "Người dùng";
  };

  useEffect(() => {
    const fetchStadiumDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy thông tin sân bóng
        let stadiumData = null;
        try {
          const stadiumResponse = await stadiumAPI.getStadiumById(stadiumId);
          stadiumData = stadiumResponse.data?.result || stadiumResponse.data;
          
          if (!stadiumData) {
            throw new Error("Không thể lấy thông tin sân");
          }
          
          setStadium(stadiumData);

          // 2. Lấy toàn bộ địa điểm
          const locationsResponse = await locationAPI.getLocations();
          const locationList = locationsResponse.data?.result || locationsResponse.data || [];
          
          if (locationList.length > 0 && stadiumData.locationId) {
            const matchedLocation = locationList.find(loc =>
              loc.locationId === stadiumData.locationId || loc.id === stadiumData.locationId
            );
            
            if (matchedLocation) {
              setLocation(matchedLocation);
            } else {
              // Thử lấy trực tiếp thông tin địa điểm theo ID
              try {
                const locationResponse = await locationAPI.getLocationById(stadiumData.locationId);
                const locationData = locationResponse.data?.result || locationResponse.data;
                if (locationData) {
                  setLocation(locationData);
                }
              } catch (locationError) {
                // Bỏ qua lỗi, không hiển thị địa điểm
              }
            }
          }

          // 3. Lấy toàn bộ loại sân
          const typesResponse = await typeAPI.getTypes();
          const typeList = typesResponse.data?.result || typesResponse.data || [];
          
          if (typeList.length > 0 && stadiumData.typeId) {
            const matchedType = typeList.find(t =>
              t.typeId == stadiumData.typeId || t.id == stadiumData.typeId
            );
            
            if (matchedType) {
              setType(matchedType);
            } else {
              try {
                const typeResponse = await typeAPI.getTypeById(stadiumData.typeId);
                const typeData = typeResponse.data?.result || typeResponse.data;
                if (typeData) {
                  setType(typeData);
                }
              } catch (typeError) {
                // Bỏ qua lỗi, không hiển thị loại sân
              }
            }
          }

          // 4. Lấy hình ảnh
          try {
            const imagesResponse = await imageAPI.getImagesByStadiumId(stadiumId);
            const images = imagesResponse.data?.result || imagesResponse.data;
            if (Array.isArray(images) && images.length > 0) {
              setStadiumImage(images[0]);
            }
          } catch (imageError) {
            // Bỏ qua lỗi, không hiển thị hình ảnh
          }

          // 5. Lấy đánh giá
          try {
            const evaluationsResponse = await evaluationAPI.getEvaluationsByStadiumId(stadiumId);
            let evaluationsList = evaluationsResponse.data?.result || evaluationsResponse.data || [];
            
            // Sắp xếp đánh giá theo thứ tự ngày mới nhất trước
            evaluationsList.sort((a, b) => {
              const dateA = new Date(a.dateCreated || a.date_created || 0);
              const dateB = new Date(b.dateCreated || b.date_created || 0);
              return dateB - dateA; // Sắp xếp giảm dần (mới nhất đầu tiên)
            });
            
            setEvaluations(evaluationsList);
          } catch (evaluationError) {
            // Bỏ qua lỗi, không hiển thị đánh giá
          }
        } catch (error) {
          throw new Error("Không thể lấy thông tin sân");
        }

        setLoading(false);
      } catch (error) {
        setError("Có lỗi xảy ra khi tải thông tin sân. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (stadiumId) {
      fetchStadiumDetails();
    }
  }, [stadiumId]);

  useEffect(() => {
    if (currentUser) {
      setBookingData(prev => ({
        ...prev,
        userId: currentUser.user_id
      }));
    }
  }, [currentUser]);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setBookingData(prev => ({
      ...prev,
      dateOfBooking: selectedDate,
      startTime: '',
      endTime: ''
    }));
    setTimeError(null);
    setBookingError(null);

    if (!isAuthenticated) {
      setBookedTimeSlots([]);
      return;
    }

    // Lọc các booking cho sân này (dựa trên locationId), ngày được chọn, và trạng thái CONFIRMED hoặc PENDING
    const relevantBookings = allBookings.filter(booking =>
      booking.locationId === stadium?.locationId &&
      booking.dateOfBooking === selectedDate &&
      (booking.status === 'CONFIRMED' || booking.status === 'PENDING')
    );

    // Lưu các khung giờ đã đặt
    setBookedTimeSlots(relevantBookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime
    })));
  };

  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    setBookingData(prev => ({
      ...prev,
      startTime
    }));
    validateTime(startTime, bookingData.endTime);
  };

  const handleEndTimeChange = (e) => {
    const endTime = e.target.value;
    setBookingData(prev => ({
      ...prev,
      endTime
    }));
    validateTime(bookingData.startTime, endTime);
  };

  const validateTime = (startTime, endTime) => {
    if (!startTime || !endTime) {
      setTimeError('Vui lòng chọn cả giờ bắt đầu và giờ kết thúc.');
      return;
    }

    // Kiểm tra định dạng HH:MM
    const timeFormat = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeFormat.test(startTime) || !timeFormat.test(endTime)) {
      setTimeError('Vui lòng nhập thời gian theo định dạng HH:MM (ví dụ: 08:13).');
      return;
    }

    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    const diffMinutes = (end - start) / (1000 * 60);

    // Kiểm tra giờ có nằm trong khoảng giờ làm việc không
    const opening = new Date(`1970-01-01T${workingHours.openingHours}`);
    const closing = new Date(`1970-01-01T${workingHours.closingHours}`);
    if (start < opening || start >= closing || end <= opening || end > closing) {
      setTimeError(`Vui lòng chọn thời gian trong khoảng ${workingHours.openingHours} - ${workingHours.closingHours}.`);
      return;
    }

    // Kiểm tra thời gian đặt tối thiểu 1 tiếng
    if (diffMinutes < 60) {
      setTimeError('Thời gian đặt sân tối thiểu là 1 tiếng.');
      return;
    }

    // Kiểm tra giờ kết thúc phải sau giờ bắt đầu
    if (start >= end) {
      setTimeError('Giờ kết thúc phải sau giờ bắt đầu.');
      return;
    }

    // Kiểm tra trùng lặp với các khung giờ đã đặt
    const hasConflict = bookedTimeSlots.some(slot => {
      const bookedStart = new Date(`1970-01-01T${slot.startTime}`);
      const bookedEnd = new Date(`1970-01-01T${slot.endTime}`);

      // Kiểm tra chồng chéo thời gian
      const isOverlap = (
        (start >= bookedStart && start < bookedEnd) ||
        (end > bookedStart && end <= bookedEnd) ||
        (start <= bookedStart && end >= bookedEnd)
      );

      if (isOverlap) {
        setTimeError(`Khung giờ từ ${slot.startTime} đến ${slot.endTime} đã được đặt. Vui lòng chọn khung giờ khác.`);
        return true;
      }

      // Kiểm tra khoảng cách 10 phút
      const minutesBeforeNext = (start - bookedEnd) / (1000 * 60);
      const minutesAfterPrevious = (bookedStart - end) / (1000 * 60);

      if (bookedEnd <= start && minutesBeforeNext < 10) {
        setTimeError(`Cần ít nhất 10 phút giữa các đơn đặt sân (${slot.startTime}-${slot.endTime}).`);
        return true;
      }

      if (bookedStart >= end && minutesAfterPrevious < 10) {
        setTimeError(`Cần ít nhất 10 phút giữa các đơn đặt sân (${slot.startTime}-${slot.endTime}).`);
        return true;
      }

      return false;
    });

    if (!hasConflict) {
      setTimeError(null);
    }
  };

  // Kiểm tra tính khả dụng của khung giờ
  const checkAvailability = async () => {
    if (!bookingData.dateOfBooking || !bookingData.startTime || !bookingData.endTime) return false;
  
    try {
      const currentDateTime = new Date();
      const selectedDateTime = new Date(`${bookingData.dateOfBooking}T${bookingData.startTime}:00`);
      const selectedEndTime = new Date(`${bookingData.dateOfBooking}T${bookingData.endTime}:00`);
  
      if (currentDateTime > selectedEndTime) {
        setBookingError('Thời gian đặt sân đã trôi qua. Vui lòng chọn thời gian khác.');
        return false;
      }
  
      // Kiểm tra từ danh sách bookedTimeSlots đã được lấy từ API
      for (const booking of bookedTimeSlots) {
        const bookingStart = new Date(`${bookingData.dateOfBooking}T${booking.startTime}:00`);
        const bookingEnd = new Date(`${bookingData.dateOfBooking}T${booking.endTime}:00`);
  
        if (currentDateTime > bookingEnd) continue;
  
        // Kiểm tra chồng chéo
        if (
          selectedDateTime.toDateString() === bookingStart.toDateString() &&
          (
            (selectedDateTime >= bookingStart && selectedDateTime < bookingEnd) ||
            (selectedEndTime > bookingStart && selectedEndTime <= bookingEnd) ||
            (selectedDateTime <= bookingStart && selectedEndTime >= bookingEnd)
          )
        ) {
          setBookingError('Khung giờ này đã được đặt. Vui lòng chọn khung giờ khác.');
          return false;
        }
  
        // Kiểm tra khoảng cách 10 phút
        const minutesBetweenEndAndStart = (selectedDateTime - bookingEnd) / (1000 * 60);
        const minutesBetweenStartAndEnd = (bookingStart - selectedEndTime) / (1000 * 60);
  
        if (bookingEnd <= selectedDateTime && minutesBetweenEndAndStart < 10) {
          setBookingError(`Khung giờ này quá gần với một đơn đặt sân khác (${booking.startTime}-${booking.endTime}). Cần ít nhất 10 phút để dọn dẹp sân.`);
          return false;
        }
  
        if (bookingStart >= selectedEndTime && minutesBetweenStartAndEnd < 10) {
          setBookingError(`Khung giờ này quá gần với một đơn đặt sân khác (${booking.startTime}-${booking.endTime}). Cần ít nhất 10 phút để dọn dẹp sân.`);
          return false;
        }
      }
  
      setBookingError(null);
      return true;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setBookingError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
        if (typeof openLoginModal === 'function') {
          openLoginModal();
        }
      } else {
        setBookingError('Không thể kiểm tra tính khả dụng. Vui lòng thử lại sau.');
      }
      return false;
    }
  };

  // Thêm các state cho modal xác nhận
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessingBooking, setIsProcessingBooking] = useState(false);

  // Thay đổi hàm handleBookingSubmit
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setBookingError('Vui lòng đăng nhập để đặt sân.');
      return;
    }

    if (!bookingData.dateOfBooking) {
      setBookingError('Vui lòng chọn ngày.');
      return;
    }

    if (!bookingData.startTime || !bookingData.endTime) {
      setBookingError('Vui lòng chọn giờ bắt đầu và giờ kết thúc.');
      return;
    }

    if (timeError) {
      setBookingError(timeError);
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) return;

    // Hiển thị modal xác nhận thay vì tạo booking ngay
    setShowConfirmModal(true);
  };

  // Thêm hàm confirmBooking để xử lý khi người dùng xác nhận đặt sân
  const confirmBooking = async (phoneNumber) => {
    try {
      setIsProcessingBooking(true);
      setBookingError(null);

      // Tính toán tổng số giờ để sử dụng ở nhiều nơi
      const totalHours = calculateTotalHours();
      const totalPrice = stadium.price * totalHours;

      // Định dạng dateOfBooking thành yyyy-MM-dd (SQL Date format)
      const dateObj = new Date(bookingData.dateOfBooking);
      const formattedDate = dateObj.toISOString().split('T')[0];

      //(SQL Time format)
      const formattedStartTime = bookingData.startTime.includes(':00') ? 
        bookingData.startTime : `${bookingData.startTime}:00`;
      const formattedEndTime = bookingData.endTime.includes(':00') ? 
        bookingData.endTime : `${bookingData.endTime}:00`;

      // Cải thiện cách lấy userId - thử lấy từ token trước
      let userId = null;
      
      // Thử lấy từ currentUser
      if (currentUser?.user_id) {
        userId = currentUser.user_id;
        console.log("Lấy userId từ currentUser:", userId);
      }
      
      // Nếu không có từ currentUser, thử lấy từ token
      if (!userId) {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("JWT payload:", payload);
              // Kiểm tra các trường có thể chứa userId
              userId = payload.userId || payload.user_id || payload.id;
              console.log("Lấy userId từ token:", userId);
            }
          } catch (e) {
            console.error("Lỗi khi phân tích token:", e);
          }
        }
      }
      
      // Nếu vẫn không có, gọi API
      if (!userId) {
        try {
          console.log("Gọi API để lấy thông tin user");
          const userResponse = await userAPI.getCurrentUser();
          console.log("User API response:", userResponse.data);
          
          // Xử lý các kiểu cấu trúc response khác nhau
          if (userResponse?.data?.result && Array.isArray(userResponse.data.result) && userResponse.data.result.length > 0) {
            userId = userResponse.data.result[0].user_id || userResponse.data.result[0].userId;
          } else if (userResponse?.data?.result?.user_id) {
            userId = userResponse.data.result.user_id;
          } else if (userResponse?.data?.user_id) {
            userId = userResponse.data.user_id;
          } else if (userResponse?.data?.id) {
            userId = userResponse.data.id;
          } else {
            // Tìm trường có thể chứa userId
            const data = userResponse?.data?.result || userResponse?.data;
            if (data) {
              for (const key in data) {
                if (key.toLowerCase().includes('id') && typeof data[key] === 'string') {
                  userId = data[key];
                  console.log("Tìm được userId từ trường:", key, userId);
                  break;
                }
              }
            }
          }
          
          if (!userId) {
            throw new Error("Không tìm thấy user_id");
          }
          
          console.log("Đã lấy được userId:", userId);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin user:", error);
          setBookingError("Không thể xác định thông tin người dùng. Vui lòng đăng nhập lại.");
          return;
        }
      }

      // Dữ liệu gửi đi - log để kiểm tra
      const bookingRequestData = {
        user_id: userId,
        location_id: stadium.locationId,
        date_of_booking: formattedDate,
        start_time: formattedStartTime,
        end_time: formattedEndTime
      };
      
      console.log("Dữ liệu booking gửi đi:", bookingRequestData);

      // 1. Tạo Booking
      const bookingResponse = await bookingAPI.createBooking(bookingRequestData);

      if (bookingResponse.data && bookingResponse.data.result) {
        const newBookingId = bookingResponse.data.result.bookingId || bookingResponse.data.result.stadium_booking_id;

        // Kiểm tra xem bookingId có giá trị không
        if (!newBookingId) {
          throw new Error("Không nhận được booking ID từ server");
        }

        try {
          // 2. Tạo Stadium_Booking_Details với total_hours và price
          const detailResponse = await stadiumBookingDetailAPI.createStadiumBookingDetail({
            stadium_booking_id: newBookingId,
            type_id: stadium.typeId,
            stadium_id: stadium.stadiumId
          });

          if (detailResponse.data && detailResponse.data.result) {
            // Lấy ID của BookingDetail từ response - kiểm tra nhiều cách đặt tên trường
            const bookingDetailId = detailResponse.data.result.id || 
                                  detailResponse.data.result.stadiumBookingDetailId || 
                                  detailResponse.data.result.stadium_booking_detail_id || 
                                  detailResponse.data.result.detailId;
            
            if (bookingDetailId) {
              localStorage.setItem(`booking_${newBookingId}_detailId`, bookingDetailId);
            } else {
              // Tìm ID theo các mẫu khác nhau
              const allKeys = Object.keys(detailResponse.data.result);
              const potentialIdKey = allKeys.find(key => 
                key.toLowerCase().includes('id') || 
                key.toLowerCase().includes('_id') || 
                key.toLowerCase().includes('detailid')
              );
              
              if (potentialIdKey) {
                const foundId = detailResponse.data.result[potentialIdKey];
                localStorage.setItem(`booking_${newBookingId}_detailId`, foundId);
              }
            }
          }

          // Không tạo Bill, BookingDetailPage
          
          setBookingSuccess(true);
          setShowConfirmModal(false);

          // Cập nhật danh sách booking
          setAllBookings(prev => [...prev, bookingResponse.data.result]);

          setBookingData({
            userId: currentUser?.user_id || '',
            locationId: stadium.locationId,
            dateOfBooking: '',
            startTime: '',
            endTime: ''
          });

          // Chuyển hướng đến trang chi tiết đặt sân
          setTimeout(() => {
            navigate(`/booking/${newBookingId}`);
          }, 1000);
        } catch (detailError) {
          // Vẫn chuyển hướng ngay cả khi có lỗi tạo booking detail
          setBookingSuccess(true);
          setShowConfirmModal(false);
          setBookingError(`Đặt sân thành công nhưng không thể tạo chi tiết đặt sân. Vui lòng liên hệ quản trị viên.`);

          // Chuyển hướng đến trang chi tiết đặt sân sau một khoảng thời gian
          setTimeout(() => {
            navigate(`/booking/${newBookingId}`);
          }, 2000);
        }
      }
    } catch (error) {
      // KHÔNG tự động đăng xuất người dùng khi gặp lỗi xác thực
      // Hiển thị thông báo lỗi rõ ràng và giữ người dùng đăng nhập
      if (error.response?.status === 401) {
        setBookingError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else if (error.response?.status === 403) {
        setBookingError('Bạn không có quyền thực hiện hành động này. Vui lòng liên hệ quản trị viên.');
      } else if (error.response?.data?.message) {
        setBookingError(`Lỗi: ${error.response.data.message}`);
      } else {
        setBookingError('Đặt sân thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsProcessingBooking(false);
    }
  };

  const handleRatingChange = (rating) => {
    setEvaluationForm(prev => ({
      ...prev,
      rating
    }));
  };

  const handleEvaluationContentChange = (e) => {
    setEvaluationForm(prev => ({
      ...prev,
      content: e.target.value
    }));
  };

  const handleEvaluationSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setEvaluationError('Vui lòng đăng nhập để đánh giá.');
      return;
    }

    if (!evaluationForm.content.trim()) {
      setEvaluationError('Vui lòng nhập nội dung đánh giá.');
      return;
    }

    if (!evaluationForm.rating || evaluationForm.rating < 1 || evaluationForm.rating > 5) {
      setEvaluationError('Vui lòng chọn số sao từ 1 đến 5.');
      return;
    }

    if (!stadiumId) {
      setEvaluationError('Không tìm thấy thông tin sân. Vui lòng thử lại.');
      return;
    }

    let userId = currentUser?.user_id;
    if (!userId) {
      try {
        const userResponse = await userAPI.getCurrentUser();
        let userData = null;
        if (userResponse.data?.result && Array.isArray(userResponse.data.result)) {
          userData = userResponse.data.result.find(user => user.email === currentUser?.email);
          if (!userData) {
            setEvaluationError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            return;
          }
        } else if (userResponse.data?.user_id) {
          userData = userResponse.data;
        } else {
          setEvaluationError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
          return;
        }

        userId = userData.user_id || userData.id;
        if (!userId) {
          setEvaluationError('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
          return;
        }
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setEvaluationError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          logout();
          if (typeof openLoginModal === 'function') {
            openLoginModal();
          }
        } else {
          setEvaluationError('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
        }
        return;
      }
    }

    try {
      setEvaluationError(null);

      const evaluationData = {
        user_id: userId,
        stadium_id: stadiumId,
        rating_score: evaluationForm.rating.toString(),
        comment: evaluationForm.content.trim(),
      };

      const evaluationResponse = await evaluationAPI.createEvaluation(evaluationData);

      if (evaluationResponse.data && evaluationResponse.data.result) {
        setEvaluationSuccess(true);

        const newEvaluation = evaluationResponse.data.result;
        setEvaluations(prev => [newEvaluation, ...prev]);
        
        // Reset về trang đầu tiên khi thêm đánh giá mới
        setCurrentPage(1);

        setEvaluationForm({
          content: '',
          rating: 5
        });

        setTimeout(() => {
          setEvaluationSuccess(false);
        }, 3000);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setEvaluationError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
        if (typeof openLoginModal === 'function') {
          openLoginModal();
        }
      } else if (error.response?.data?.message) {
        setEvaluationError(`Lỗi: ${error.response.data.message}`);
      } else {
        setEvaluationError('Đánh giá thất bại. Vui lòng thử lại sau.');
      }
    }
  };

  // Render lịch làm việc
  const renderWorkSchedule = () => {
    if (!workSchedule || workSchedule.length === 0) {
      return <p className="no-schedule">Chưa có thông tin lịch hoạt động</p>;
    }
    
    const daysOfWeek = {
      'Monday': 'Thứ Hai',
      'Tuesday': 'Thứ Ba',
      'Wednesday': 'Thứ Tư',
      'Thursday': 'Thứ Năm',
      'Friday': 'Thứ Sáu',
      'Saturday': 'Thứ Bảy',
      'Sunday': 'Chủ Nhật'
    };
    
    return (
      <div className="schedule-table">
        {workSchedule.map((schedule, index) => (
          <div key={index} className="schedule-row">
            <div className="day">{daysOfWeek[schedule.dayOfTheWeek]}</div>
            <div className="hours">
              {schedule.openingHours} - {schedule.closingHours}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Hàm mapping trạng thái từ API sang text tiếng Việt
  const mapStatusToText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'ĐANG CHỜ';
      case 'CONFIRMED':
        return 'ĐÃ XÁC NHẬN';
      case 'COMPLETED':
        return 'ĐÃ HOÀN THÀNH';
      case 'CANCELLED':
        return 'ĐÃ HỦY';
      default:
        return 'KHÔNG XÁC ĐỊNH';
    }
  };

  if (loading) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="loading">Đang tải thông tin sân bóng...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="error-message">{error}</div>
          <Link to="/danh-sach-san" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sân
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="stadium-detail-page">
        <Navbar />
        <div className="container">
          <div className="error-message">Không tìm thấy sân bóng.</div>
          <Link to="/danh-sach-san" className="back-button">
            <FontAwesomeIcon icon={faArrowLeft} /> Quay lại danh sách sân
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const calculateTotalPrice = () => {
    if (!stadium || !bookingData.startTime || !bookingData.endTime) return 0;

    const start = new Date(`1970-01-01T${bookingData.startTime}:00`);
    const end = new Date(`1970-01-01T${bookingData.endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    return stadium.price * hours;
  };

  const calculateAverageRating = () => {
    if (!evaluations || evaluations.length === 0) return 0;

    const validRatings = evaluations
      .map(e => getEvaluationRating(e))
      .filter(r => r > 0);

    if (validRatings.length === 0) return 0;

    const sum = validRatings.reduce((total, rating) => total + rating, 0);
    return (sum / validRatings.length).toFixed(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FontAwesomeIcon
          key={i}
          icon={faStar}
          className={i <= rating ? 'star filled' : 'star empty'}
        />
      );
    }
    return stars;
  };

  const getStadiumImageUrl = () => {
    if (stadiumImage && stadiumImage.imageUrl) {
      return `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080'}${stadiumImage.imageUrl}`;
    }
    return '/stadium-placeholder.jpg';
  };

  // Thêm hàm để tính tổng số giờ đặt sân
  const calculateTotalHours = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    
    const startTime = new Date(`1970-01-01T${bookingData.startTime}`);
    const endTime = new Date(`1970-01-01T${bookingData.endTime}`);
    
    // Tính số giờ (chênh lệch tính bằng mili giây, chia cho số mili giây trong 1 giờ)
    const diffHours = (endTime - startTime) / (1000 * 60 * 60);
    
    return Math.round(diffHours * 100) / 100; // Làm tròn đến 2 chữ số thập phân
  };

  return (
    <div className="stadium-detail-page">
      <Navbar />

      <div className="stadium-detail-container">
        <div className="container">
          <div className="breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link to="/danh-sach-san">Danh sách sân</Link>
            <span className="separator">/</span>
            <span className="current">{stadium.stadiumName}</span>
          </div>

          <div className="stadium-detail-content">
            <div className="stadium-header">
              <h1 className="stadium-title">{stadium.stadiumName}</h1>
              <div className="stadium-rating">
                {renderRatingStars(calculateAverageRating())}
                <span className="rating-value">{calculateAverageRating()}</span>
                <span className="reviews-count">({evaluations.length} đánh giá)</span>
              </div>
              <div className="stadium-location-header">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
                <span className="full-address">{getFullAddress()}</span>
              </div>
            </div>

            <div className="stadium-gallery">
              <div className="main-image">
                <img
                  src={getStadiumImageUrl()}
                  alt={stadium.stadiumName}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/stadium-placeholder.jpg';
                  }}
                />
                <div className="stadium-type">{getTypeName(type)}</div>
              </div>
            </div>

            <div className="stadium-info-booking">
              <div className="stadium-info">
                <div className="stadium-meta">
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="meta-icon" />
                    <span className="full-address">{getFullAddress()}</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={getTypeIcon(type?.typeName)} className="meta-icon" style={{ color: getTypeColor(type?.typeName) }} />
                    <span>{getTypeName(type)}</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="meta-icon" />
                    <span>{stadium.price?.toLocaleString() || 0} VNĐ/giờ</span>
                  </div>
                  <div className="meta-item">
                    <FontAwesomeIcon icon={stadium.status === 'AVAILABLE' ? faCheckCircle : faTimesCircle} className="meta-icon" />
                    <span className={`status ${stadium.status?.toLowerCase() || ''}`}>
                      {stadium.status === 'AVAILABLE' ? 'Còn trống' :
                       stadium.status === 'MAINTENANCE' ? 'Bảo trì' :
                       stadium.status === 'BOOKED' ? 'Đã đặt' : stadium.status}
                    </span>
                  </div>
                </div>

                <div className="stadium-description">
                  <h3>Giới thiệu sân</h3>
                  <p>{stadium.description || 'Không có mô tả cho sân bóng này.'}</p>
                </div>

                <div className="stadium-map">
                  <h3><FontAwesomeIcon icon={faMapMarkerAlt} /> Vị trí sân trên bản đồ</h3>
                  {(mapCoordinates?.latitude && mapCoordinates?.longitude) ? (
                    <GoongMap 
                      latitude={mapCoordinates.latitude} 
                      longitude={mapCoordinates.longitude}
                      locationName={stadium.stadiumName}
                      address={getFullAddress()}
                      height="400px"
                    />
                  ) : (
                    <div className="map-placeholder">
                      <p className="map-message">Không thể tự động lấy tọa độ cho địa chỉ: {getFullAddress()}</p>
                      <div className="map-actions">
                        <button 
                          className="retry-geocoding" 
                          onClick={() => {
                            // Thử lại việc lấy tọa độ
                            if (location || stadium?.locationId) {
                              const fetchCoordinates = async () => {
                                try {
                                  const fullAddress = getFullAddress();
                                  if (!fullAddress || fullAddress === "Đang cập nhật địa chỉ...") {
                                    alert('Không có đủ thông tin địa chỉ để tìm tọa độ');
                                    return;
                                  }
                                  
                                  console.log('Thử lại geocoding với địa chỉ:', fullAddress);
                                  try {
                                    const response = await goongMapAPI.geocode(fullAddress);
                                    
                                    if (response.data && response.data.results && response.data.results.length > 0) {
                                      const result = response.data.results[0];
                                      const coordinates = result.geometry?.location;
                                      
                                      if (coordinates && coordinates.lat && coordinates.lng) {
                                        console.log('Đã lấy tọa độ từ geocoding:', coordinates);
                                        setMapCoordinates({
                                          latitude: coordinates.lat,
                                          longitude: coordinates.lng
                                        });
                                      } else {
                                        alert('Không tìm thấy tọa độ cho địa chỉ này');
                                      }
                                    } else {
                                      alert('Không tìm thấy tọa độ cho địa chỉ này');
                                    }
                                  } catch (error) {
                                    alert('Không thể kết nối với dịch vụ bản đồ. Vui lòng thử lại sau.');
                                    console.error('Lỗi khi gọi geocoding API:', error);
                                  }
                                } catch (error) {
                                  console.error('Lỗi khi lấy tọa độ:', error);
                                }
                              };
                              fetchCoordinates();
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={faMapMarkerAlt} /> Thử lấy tọa độ lại
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="stadium-evaluations">
                  <h3>Đánh giá từ người dùng</h3>

                  {isAuthenticated && (
                    <div className="evaluation-form-container">
                      <div className="feedback-policy-notice">
                        <i className="fas fa-info-circle"></i>
                        <p>Để đảm bảo tính xác thực, bạn chỉ có thể đánh giá sân này sau khi đã đặt và sử dụng sân thành công. Vui lòng sử dụng chức năng đánh giá trong trang chi tiết đặt sân (Tài khoản &gt; Lịch sử đặt sân &gt; Xem chi tiết &gt; Đánh giá) khi trạng thái đặt sân của bạn đã chuyển sang HOÀN THÀNH.</p>
                      </div>
                    </div>
                  )}

                  {/* {!isAuthenticated && (
                    <div className="login-prompt">
                      <p>Vui lòng <span style={{ color: '#1a4297', cursor: 'default' }}>đăng nhập</span> để xem các đánh giá.</p>
                    </div>
                  )} */}

                  <div className="evaluations-list">
                    {evaluations.length === 0 ? (
                      <p className="no-evaluations">Chưa có đánh giá nào cho sân này.</p>
                    ) : (
                      <>
                        {evaluations
                          .slice((currentPage - 1) * evaluationsPerPage, currentPage * evaluationsPerPage)
                          .map((evaluation, index) => (
                        <div key={evaluation.evaluationId || evaluation.id || index} className="evaluation-item">
                          <div className="evaluation-header">
                            <div className="user-name-field">
                              <FontAwesomeIcon icon={faUser} className="user-icon" />
                              <span className="user-name">
                                {handleUserDisplay(evaluation)}
                              </span>
                            </div>
                            <div className="evaluation-rating">
                              {renderRatingStars(getEvaluationRating(evaluation))}
                            </div>
                          </div>
                          <div className="evaluation-content">
                            {getEvaluationContent(evaluation) ? (
                              <p>{getEvaluationContent(evaluation)}</p>
                            ) : null}
                          </div>
                          <div className="evaluation-date">
                            <FontAwesomeIcon icon={faCalendarAlt} />
                            <span>{formatDate(evaluation.dateCreated || evaluation.date_created)}</span>
                          </div>
                        </div>
                      ))
                        }
                        
                        {evaluations.length > evaluationsPerPage && (
                          <div className="pagination">
                            <button 
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                            >
                              Trang trước
                            </button>
                            
                            <span>Trang {currentPage} / {Math.ceil(evaluations.length / evaluationsPerPage)}</span>
                            
                            <button 
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(evaluations.length / evaluationsPerPage)))}
                              disabled={currentPage === Math.ceil(evaluations.length / evaluationsPerPage)}
                            >
                              Trang sau
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3>Đặt sân</h3>

                <div className="stadium-operating-hours">
                  <h4><FontAwesomeIcon icon={faClock} /> Giờ mở cửa</h4>
                  {renderWorkSchedule()}
                </div>

                {bookingSuccess && (
                  <div className="booking-success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <p>Đặt sân thành công! Đang chuyển hướng đến trang chi tiết đặt sân...</p>
                  </div>
                )}

                {bookingError && (
                  <div className="booking-error">
                    <FontAwesomeIcon icon={faTimesCircle} />
                    <p>{bookingError}</p>
                  </div>
                )}

                {bookingData.dateOfBooking && isAuthenticated && (
                  <div className="booked-time-slots">
                    <h4>Khung giờ đã được đặt trong ngày {new Date(bookingData.dateOfBooking).toLocaleDateString('vi-VN')}:</h4>
                    {bookedTimeSlots.length === 0 ? (
                      <p className="no-booked-slots">Chưa có khung giờ nào được đặt trong ngày này.</p>
                    ) : (
                      <div className="booked-slots-list">
                        {bookedTimeSlots.map((slot, index) => (
                          <div key={index} className="booked-slot-card">
                            <div className="slot-time">
                              <FontAwesomeIcon icon={faClock} className="time-icon" />
                              <span className="time-value">{slot.startTime} - {slot.endTime}</span>
                              </div>
                            <div className={`slot-status status-${slot.status.toLowerCase()}`}>
                              {mapStatusToText(slot.status)}
                        </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {bookingData.dateOfBooking && !isAuthenticated && (
                  <div className="booked-time-slots">
                    <p>Vui lòng <span style={{ color: '#1a4297', cursor: 'default' }}>đăng nhập</span> để xem khung giờ đã đặt.</p>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="booking-form">
                  <div className="form-group">
                    <label>Chọn ngày:</label>
                    <input
                      type="date"
                      value={bookingData.dateOfBooking}
                      onChange={handleDateChange}
                      className="form-control"
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {bookingData.dateOfBooking && (
                    <div className="form-group">
                      <label>Chọn giờ bắt đầu
                        <span className="working-hours-hint">
                          ({workingHours.openingHours} - {workingHours.closingHours})
                        </span>
                      </label>
                      <div className="time-input-wrapper">
                      <input
                          type="text"
                          placeholder="HH:MM"
                          pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                          value={bookingData.startTime}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === '' ||
                              /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) ||
                              /^([01]?[0-9]|2[0-3]):[0-5]?$/.test(value) ||
                              /^([01]?[0-9]|2[0-3]):?$/.test(value) ||
                              /^([01]?[0-9]|2[0-3])$/.test(value)
                            ) {
                              handleStartTimeChange({ target: { value } });
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                              setTimeError('Vui lòng nhập thời gian theo định dạng HH:MM (ví dụ: 08:13).');
                              handleStartTimeChange({ target: { value: '' } });
                            } else if (value) {
                              const [hourStr, minuteStr] = value.split(':');
                              const hour = parseInt(hourStr, 10);
                              const minute = parseInt(minuteStr, 10);
                              const openingHour = parseInt(workingHours.openingHours.split(':')[0], 10);
                              const openingMinute = parseInt(workingHours.openingHours.split(':')[1], 10);
                              const closingHour = parseInt(workingHours.closingHours.split(':')[0], 10);
                              const closingMinute = parseInt(workingHours.closingHours.split(':')[1], 10);

                              const startMinutes = hour * 60 + minute;
                              const openingMinutes = openingHour * 60 + openingMinute;
                              const closingMinutes = closingHour * 60 + closingMinute;

                              if (startMinutes < openingMinutes || startMinutes >= closingMinutes) {
                                handleStartTimeChange({ target: { value: '' } });
                                setTimeError(`Vui lòng chọn thời gian trong khoảng ${workingHours.openingHours} - ${workingHours.closingHours}.`);
                              } else {
                                const formattedValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                handleStartTimeChange({ target: { value: formattedValue } });
                              }
                            }
                          }}
                          className={`form-control custom-time-input ${timeError ? 'error' : ''}`}
                          required
                        />
                        <select
                          className="quick-time-select"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleStartTimeChange({ target: { value: e.target.value } });
                            }
                          }}
                          value=""
                        >
                          <option value="">Giờ nhanh</option>
                          {generateTimeOptions(
                            parseInt(workingHours.openingHours.split(':')[0], 10),
                            parseInt(workingHours.closingHours.split(':')[0], 10) - 1
                          ).map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {bookingData.dateOfBooking && (
                    <div className="form-group">
                      <label>Chọn giờ kết thúc
                        <span className="working-hours-hint">
                          ({workingHours.openingHours} - {workingHours.closingHours})
                        </span>
                      </label>
                      <div className="time-input-wrapper">
                      <input
                          type="text"
                          placeholder="HH:MM"
                          pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                          value={bookingData.endTime}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (
                              value === '' ||
                              /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) ||
                              /^([01]?[0-9]|2[0-3]):[0-5]?$/.test(value) ||
                              /^([01]?[0-9]|2[0-3]):?$/.test(value) ||
                              /^([01]?[0-9]|2[0-3])$/.test(value)
                            ) {
                              handleEndTimeChange({ target: { value } });
                            }
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (value && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
                              setTimeError('Vui lòng nhập thời gian theo định dạng HH:MM (ví dụ: 09:22).');
                              handleEndTimeChange({ target: { value: '' } });
                            } else if (value) {
                              const [hourStr, minuteStr] = value.split(':');
                              const hour = parseInt(hourStr, 10);
                              const minute = parseInt(minuteStr, 10);
                              const openingHour = parseInt(workingHours.openingHours.split(':')[0], 10);
                              const openingMinute = parseInt(workingHours.openingHours.split(':')[1], 10);
                              const closingHour = parseInt(workingHours.closingHours.split(':')[0], 10);
                              const closingMinute = parseInt(workingHours.closingHours.split(':')[1], 10);

                              const endMinutes = hour * 60 + minute;
                              const openingMinutes = openingHour * 60 + openingMinute;
                              const closingMinutes = closingHour * 60 + closingMinute;

                              if (endMinutes <= openingMinutes || endMinutes > closingMinutes) {
                                handleEndTimeChange({ target: { value: '' } });
                                setTimeError(`Vui lòng chọn thời gian trong khoảng ${workingHours.openingHours} - ${workingHours.closingHours}.`);
                              } else {
                                const formattedValue = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                                handleEndTimeChange({ target: { value: formattedValue } });
                              }
                            }
                          }}
                          className={`form-control custom-time-input ${timeError ? 'error' : ''}`}
                          required
                        />
                        <select
                          className="quick-time-select"
                          onChange={(e) => {
                            if (e.target.value) {
                              handleEndTimeChange({ target: { value: e.target.value } });
                            }
                          }}
                          value=""
                        >
                          <option value="">Giờ nhanh</option>
                          {generateTimeOptions(
                            parseInt(workingHours.openingHours.split(':')[0], 10) + 1,
                            parseInt(workingHours.closingHours.split(':')[0], 10)
                          ).map(time => (
                            <option key={time} value={time}>{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {timeError && (
                    <div className="booking-error">
                      <FontAwesomeIcon icon={faTimesCircle} />
                      <p>{timeError}</p>
                    </div>
                  )}

                  <div className="booking-summary">
                    <h4>Thông tin đặt sân</h4>
                    <div className="summary-item">
                      <span>Sân:</span>
                      <span>{stadium.stadiumName}</span>
                    </div>
                    {bookingData.dateOfBooking && (
                      <div className="summary-item">
                        <span>Ngày:</span>
                        <span>{new Date(bookingData.dateOfBooking).toLocaleDateString()}</span>
                      </div>
                    )}
                    {bookingData.startTime && bookingData.endTime && (
                      <div className="summary-item">
                        <span>Giờ:</span>
                        <span>{`${bookingData.startTime} - ${bookingData.endTime}`}</span>
                      </div>
                    )}
                    <div className="summary-item total">
                      <span>Tổng tiền tạm tính:</span>
                      <span>{calculateTotalPrice().toLocaleString()} VNĐ</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="booking-button"
                    disabled={!isAuthenticated || !bookingData.dateOfBooking || !bookingData.startTime || !bookingData.endTime || timeError || stadium.status === 'MAINTENANCE' || stadium.status === 'BOOKED' || bookingSuccess}
                  >
                    {!isAuthenticated ? 'Vui lòng đăng nhập để đặt sân' : 'Đặt sân ngay'}
                  </button>

                  {!isAuthenticated && (
                    <div className="login-prompt">
                      <p>Vui lòng <span style={{ color: '#1a4297', cursor: 'default' }}>đăng nhập</span> để đặt sân.</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <BookingConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmBooking}
        stadium={stadium}
        location={location}
        type={type}
        bookingData={bookingData}
        currentUser={currentUser}
        calculateTotalHours={calculateTotalHours}
        formatDate={formatDate}
        isLoading={isProcessingBooking}
      />
    </div>
  );
};

export default StadiumDetailPage;