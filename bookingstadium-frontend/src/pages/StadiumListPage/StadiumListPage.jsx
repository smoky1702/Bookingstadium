import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStar, faMapMarkerAlt, faTag, faMoneyBillWave, faFutbol, faCheckCircle, faTimesCircle, faBuilding, faCity, faBasketballBall, faVolleyballBall, faTableTennis, faCalendarPlus, faLocationArrow, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { stadiumAPI, typeAPI, locationAPI, imageAPI, apiClient } from '../../services/apiService';
import './StadiumListPage.css';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Mảng các icon có sẵn
const availableIcons = [
  { name: 'Bóng đá', icon: faFutbol },
  { name: 'Bóng rổ', icon: faBasketballBall },
  { name: 'Bóng chuyền', icon: faVolleyballBall },
  { name: 'Cầu lông', icon: faTableTennis }
];

// Mảng các màu có sẵn
const availableColors = [
  { name: 'Xanh lá', color: '#28a745' },
  { name: 'Cam', color: '#fd7e14' },
  { name: 'Đỏ', color: '#dc3545' },
  { name: 'Tím', color: '#6f42c1' },
  { name: 'Xanh dương', color: '#1a4297' },
  { name: 'Vàng', color: '#ffc107' },
  { name: 'Hồng', color: '#e83e8c' },
  { name: 'Lam', color: '#17a2b8' }
];

const StadiumListPage = () => {
  const [stadiums, setStadiums] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [stadiumImages, setStadiumImages] = useState({});
  
  // State cấu hình hiển thị (chỉ đọc)
  const [typeStyleSettings, setTypeStyleSettings] = useState({});

  const navigate = useNavigate();

  // Lấy cấu hình màu sắc và icon từ localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('typeStyleSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setTypeStyleSettings(settings);
      } catch (e) {
        console.error("Lỗi khi đọc cài đặt từ localStorage:", e);
      }
    }
  }, []);

  // Fetch dữ liệu
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
      // Fetch stadiums
      console.log('=====================================================');
      console.log('>> FETCH STADIUMS START');
      console.log('=====================================================');
      
      let processedStadiums = [];
      
      try {
        console.log('>> Sử dụng API stadium thông thường...');
        // Gọi API thông qua service đã được định nghĩa
        const response = await stadiumAPI.getStadiums();
        
        // Đặt dữ liệu vào state
        const stadiumData = response.data;
        console.log('>> Dữ liệu sân:', stadiumData);
        
        // In chi tiết cấu trúc đầy đủ của dữ liệu
        console.log('>> Cấu trúc dữ liệu đầy đủ:', JSON.stringify(stadiumData, null, 2));
        
        if (Array.isArray(stadiumData)) {
          processedStadiums = stadiumData;
        } else if (stadiumData && Array.isArray(stadiumData.result)) {
          processedStadiums = stadiumData.result;
        } else if (stadiumData && Array.isArray(stadiumData.data)) {
          processedStadiums = stadiumData.data;
        } else if (stadiumData && Array.isArray(stadiumData.content)) {
          processedStadiums = stadiumData.content;
        } else {
          console.error('>> Không tìm thấy dữ liệu sân trong response:', stadiumData);
          throw new Error('Không tìm thấy dữ liệu sân trong định dạng mong đợi');
        }
      } catch (err) {
        console.error('>> Lỗi khi lấy thông tin stadiums từ API thông thường:', err);
        
        // Thử dùng endpoint thay thế
        try {
          console.log('>> Thử API endpoint thay thế...');
          const alternativeResponse = await stadiumAPI.getStadiumsAlternative();
          const alternativeData = alternativeResponse.data;
          
          if (Array.isArray(alternativeData)) {
            processedStadiums = alternativeData;
          } else if (alternativeData && Array.isArray(alternativeData.result)) {
            processedStadiums = alternativeData.result;
          } else if (alternativeData && Array.isArray(alternativeData.data)) {
            processedStadiums = alternativeData.data;
          } else {
            throw new Error('Không tìm thấy dữ liệu sân từ endpoint thay thế');
          }
        } catch (altErr) {
          console.error('>> Lỗi khi lấy thông tin stadiums từ endpoint thay thế:', altErr);
          setError(`Không thể tải dữ liệu sân bóng. Vui lòng đảm bảo backend đang chạy.`);
          setLoading(false);
          return; // Kết thúc hàm vì không thể lấy dữ liệu stadium
        }
      }
      
      // Ở đây đã có dữ liệu sân
      console.log('>> Lấy được danh sách stadiums:', processedStadiums.length);
      
      // Hiển thị chi tiết stadium đầu tiên để debug
      if (processedStadiums.length > 0) {
        console.log('>> Mẫu stadium đầu tiên:', processedStadiums[0]);
      }
      
      // Cập nhật state ban đầu với dữ liệu sân
      setStadiums(processedStadiums);
      
      // Lấy ảnh cho các sân
      console.log('=====================================================');
      console.log('>> FETCH IMAGES FOR STADIUMS');
      console.log('=====================================================');
      
      const fetchImagesForStadiums = async (stadiumsList) => {
        try {
          console.log(`>> Bắt đầu lấy ảnh cho ${stadiumsList.length} sân bóng`);
          const imagesMap = {};
          
          // Gọi API lấy tất cả ảnh
          try {
            console.log(`>> Gọi API lấy tất cả ảnh từ server`);
            const response = await imageAPI.getImages();
            
            // In nội dung response để debug
            console.log(`>> API images trả về:`, response.data);
            
            // Nếu có dữ liệu ảnh
            if (response.data && response.data.result && Array.isArray(response.data.result)) {
              const allImages = response.data.result;
              console.log(`>> Lấy được ${allImages.length} ảnh từ server`);
              
              // In thông tin chi tiết của các ảnh để debug
              allImages.forEach((image, index) => {
                console.log(`>> Ảnh #${index}: stadiumId=${image.stadiumId}, imageUrl=${image.imageUrl}`);
              });
              
              // Phân bổ ảnh cho các sân dựa trên stadiumId
              for (const stadium of stadiumsList) {
                const stadiumId = stadium.stadiumId || stadium.id;
                if (!stadiumId) continue;
                
                // Tìm ảnh của sân này trong danh sách ảnh
                const stadiumImages = allImages.filter(img => img.stadiumId === stadiumId);
                
                if (stadiumImages.length > 0) {
                  // Lấy ảnh đầu tiên
                  const imageUrl = stadiumImages[0].imageUrl;
                  imagesMap[stadiumId] = imageUrl;
                  console.log(`>> Đã tìm thấy ảnh cho sân ${stadiumId}: ${imageUrl}`);
                } else {
                  console.log(`>> Không tìm thấy ảnh nào cho sân ${stadiumId}`);
                }
              }
            }
          } catch (error) {
            console.error(`>> Lỗi khi lấy tất cả ảnh: ${error.message}`);
          }
          
          console.log(`>> Đã tìm được ảnh cho ${Object.keys(imagesMap).length}/${stadiumsList.length} sân`);
          console.log(`>> Chi tiết ảnh đã phân bổ:`, imagesMap);
          setStadiumImages(imagesMap);
        } catch (error) {
          console.error(`>> Lỗi khi lấy ảnh: ${error.message}`);
        }
      };
      
      // Gọi hàm lấy ảnh sau khi đã có danh sách sân
      await fetchImagesForStadiums(processedStadiums);
      
      // Lấy chi tiết location cho các stadium
      console.log('=====================================================');
      console.log('>> FETCH LOCATIONS FOR STADIUMS');
      console.log('=====================================================');
      
      // Đặt cờ để kiểm tra đã lấy thành công dữ liệu location chưa
      let locationsFetched = false;
      
      // Thử lấy locations từ API chính
      try {
        console.log('>> Thử lấy dữ liệu từ endpoint /location...');
        const locationsResponse = await locationAPI.getLocations();
        const locationsData = locationsResponse.data;
        
        let locations = [];
        if (Array.isArray(locationsData)) {
          locations = locationsData;
        } else if (locationsData && Array.isArray(locationsData.result)) {
          locations = locationsData.result;
        } else if (locationsData && Array.isArray(locationsData.data)) {
          locations = locationsData.data;
        } else {
          console.warn('>> Không tìm thấy dữ liệu locations từ API');
          throw new Error('Cấu trúc location không đúng');
        }
        
        console.log('>> Lấy được danh sách locations:', locations.length);
        
        // Cập nhật thông tin location cho mỗi stadium
        if (locations.length > 0) {
          locationsFetched = true;
          const enhancedStadiums = processedStadiums.map(stadium => {
            const locationId = stadium.locationId;
            if (!locationId) {
              console.warn(`>> Stadium ${stadium.stadiumId || stadium.id} không có locationId`);
              return stadium;
            }
            
            // Tìm location tương ứng
            const matchingLocation = locations.find(loc => 
              loc.locationId === locationId || loc.id === locationId
            );
            
            if (matchingLocation) {
              console.log(`>> Đã tìm thấy location cho stadium: ${stadium.stadiumId || stadium.id}`);
              return {
                ...stadium,
                location: matchingLocation, // Lưu toàn bộ thông tin location
                locationName: matchingLocation.locationName || matchingLocation.name || matchingLocation.location_name,
                address: matchingLocation.address,
                district: matchingLocation.district,
                city: matchingLocation.city
              };
            }
            
            return stadium;
          });
          
          // Cập nhật state với thông tin đã bổ sung
          setStadiums(enhancedStadiums);
        }
      } catch (locErr) {
        console.warn('>> Lỗi khi lấy locations từ API chính:', locErr);
      }
      
      // Nếu không lấy được từ API chính, thử API thay thế
      if (!locationsFetched) {
        try {
          console.log('>> Thử lấy dữ liệu từ endpoint thay thế /locations...');
          const locationsAltResponse = await locationAPI.getLocationsAlternative();
          const locationsAltData = locationsAltResponse.data;
          
          let locations = [];
          if (Array.isArray(locationsAltData)) {
            locations = locationsAltData;
          } else if (locationsAltData && Array.isArray(locationsAltData.result)) {
            locations = locationsAltData.result;
          } else if (locationsAltData && Array.isArray(locationsAltData.data)) {
            locations = locationsAltData.data;
          } else {
            console.warn('>> Không tìm thấy dữ liệu locations từ API thay thế');
            throw new Error('Cấu trúc location không đúng');
          }
          
          console.log('>> Lấy được danh sách locations từ API thay thế:', locations.length);
          
          // Cập nhật thông tin location cho mỗi stadium
          if (locations.length > 0) {
            locationsFetched = true;
            const enhancedStadiums = processedStadiums.map(stadium => {
              const locationId = stadium.locationId;
              if (!locationId) return stadium;
              
              // Tìm location tương ứng
              const matchingLocation = locations.find(loc => 
                loc.locationId === locationId || loc.id === locationId
              );
              
              if (matchingLocation) {
                return {
                
                  ...stadium,
                  location: matchingLocation,
                  locationName: matchingLocation.locationName || matchingLocation.name || matchingLocation.location_name,
                  address: matchingLocation.address,
                  district: matchingLocation.district,
                  city: matchingLocation.city
                };
              }
              
              return stadium;
            });
            
            // Cập nhật state với thông tin đã bổ sung
            setStadiums(enhancedStadiums);
          }
        } catch (locAltErr) {
          console.warn('>> Lỗi khi lấy locations từ API thay thế:', locAltErr);
        }
      }
      
      // Nếu vẫn không lấy được, thử từ stadium_location
      if (!locationsFetched) {
        try {
          console.log('>> Thử lấy dữ liệu từ endpoint /stadium_location...');
          const stadiumLocResponse = await locationAPI.getStadiumLocations();
          const stadiumLocData = stadiumLocResponse.data;
          
          let stadiumLocations = [];
          if (Array.isArray(stadiumLocData)) {
            stadiumLocations = stadiumLocData;
          } else if (stadiumLocData && Array.isArray(stadiumLocData.result)) {
            stadiumLocations = stadiumLocData.result;
          } else if (stadiumLocData && Array.isArray(stadiumLocData.data)) {
            stadiumLocations = stadiumLocData.data;
          } else {
            console.warn('>> Không tìm thấy dữ liệu stadium_location');
            throw new Error('Cấu trúc stadium_location không đúng');
          }
          
          console.log('>> Lấy được danh sách stadium_location:', stadiumLocations.length);
          
          // Cập nhật thông tin location từ stadium_location
          if (stadiumLocations.length > 0) {
            locationsFetched = true;
            const enhancedStadiums = processedStadiums.map(stadium => {
              // Tìm stadium_location theo stadiumId
              const stadiumId = stadium.stadiumId || stadium.id;
              const matchingStadiumLoc = stadiumLocations.find(sl => 
                sl.stadiumId === stadiumId || sl.stadium?.id === stadiumId
              );
              
              if (matchingStadiumLoc) {
                // Nếu stadium_location có location object, sử dụng nó
                if (matchingStadiumLoc.location) {
                  const locationData = matchingStadiumLoc.location;
                  return {
                    ...stadium,
                    location: locationData,
                    locationName: locationData.locationName || locationData.name || locationData.location_name,
                    address: locationData.address,
                    district: locationData.district,
                    city: locationData.city
                  };
                }
                
                // Hoặc nếu stadium_location có thông tin location trực tiếp
                return {
                  ...stadium,
                  location: matchingStadiumLoc,
                  locationName: matchingStadiumLoc.locationName || matchingStadiumLoc.name || matchingStadiumLoc.location_name,
                  address: matchingStadiumLoc.address,
                  district: matchingStadiumLoc.district,
                  city: matchingStadiumLoc.city
                };
              }
              
              return stadium;
            });
            
            // Cập nhật state với thông tin đã bổ sung
            setStadiums(enhancedStadiums);
          }
        } catch (slErr) {
          console.warn('>> Lỗi khi lấy dữ liệu stadium_location:', slErr);
        }
      }
      
      // Nếu vẫn không lấy được dữ liệu từ bất kỳ endpoint nào, 
      // lấy từng location cho mỗi stadium
      if (!locationsFetched) {
        try {
          console.log('>> Thử lấy location cho từng stadium một...');
          const enhancedStadiums = [...processedStadiums];
          let locationUpdated = false;
          
          for (const stadium of enhancedStadiums) {
            const locationId = stadium.locationId;
            if (!locationId) continue;
            
            try {
              console.log(`>> Lấy thông tin location cho stadium: ${stadium.stadiumId || stadium.id}, locationId: ${locationId}`);
              const locationResponse = await locationAPI.getLocationById(locationId);
              const locationData = locationResponse.data;
              
              if (locationData) {
                // Tìm stadium trong array và cập nhật
                const index = enhancedStadiums.findIndex(s => 
                  (s.stadiumId && s.stadiumId === stadium.stadiumId) || 
                  (s.id && s.id === stadium.id)
                );
                
                if (index !== -1) {
                  console.log(`>> Đã tìm thấy và cập nhật location cho stadium: ${stadium.stadiumId || stadium.id}`);
                  enhancedStadiums[index] = {
                    ...enhancedStadiums[index],
                    location: locationData,
                    locationName: locationData.locationName || locationData.name || locationData.location_name,
                    address: locationData.address,
                    district: locationData.district,
                    city: locationData.city
                  };
                  locationUpdated = true;
                }
              }
            } catch (singleLocErr) {
              console.error(`>> Lỗi khi lấy location cho stadium ${stadium.stadiumId || stadium.id}:`, singleLocErr);
              
              // Thử endpoint thay thế
              try {
                console.log(`>> Thử endpoint thay thế cho location ID ${locationId}`);
                const altResponse = await locationAPI.getLocationByIdAlternative(locationId);
                const altLocationData = altResponse.data;
                
                if (altLocationData) {
                  // Tìm stadium trong array và cập nhật
                  const index = enhancedStadiums.findIndex(s => 
                    (s.stadiumId && s.stadiumId === stadium.stadiumId) || 
                    (s.id && s.id === stadium.id)
                  );
                  
                  if (index !== -1) {
                    console.log(`>> Đã tìm thấy và cập nhật location (từ API thay thế) cho stadium: ${stadium.stadiumId || stadium.id}`);
                    enhancedStadiums[index] = {
                      ...enhancedStadiums[index],
                      location: altLocationData,
                      locationName: altLocationData.locationName || altLocationData.name || altLocationData.location_name,
                      address: altLocationData.address,
                      district: altLocationData.district,
                      city: altLocationData.city
                    };
                    locationUpdated = true;
                  }
                }
              } catch (altErr) {
                console.error(`>> Cả API chính và thay thế đều không lấy được location cho stadium ${stadium.stadiumId || stadium.id}`);
              }
            }
          }
          
          // Cập nhật stadiums nếu có thay đổi
          if (locationUpdated) {
            console.log('>> Đã cập nhật locations cho một số stadium, cập nhật state');
            setStadiums([...enhancedStadiums]);
          }
        } catch (batchLocErr) {
          console.error('>> Lỗi khi xử lý locations cho từng stadium:', batchLocErr);
        }
      }
      
      // Fetch types
      console.log('=====================================================');
      console.log('>> FETCH TYPES START');
      console.log('=====================================================');
      
      try {
        // Sử dụng API service
        const response = await typeAPI.getTypes();
        const typeData = response.data;
        
        console.log('>> Type API Response:', typeData);
        
        let processedTypes = [];
        
        if (Array.isArray(typeData)) {
          processedTypes = typeData;
        } else if (typeData && Array.isArray(typeData.result)) {
          processedTypes = typeData.result;
        } else if (typeData && Array.isArray(typeData.data)) {
          processedTypes = typeData.data;
        } else {
          console.warn('>> Không tìm thấy dữ liệu types trong cấu trúc response');
          
          // Thử endpoint thay thế
          try {
            const altResponse = await typeAPI.getTypesAlternative();
            const altData = altResponse.data;
            
            if (Array.isArray(altData)) {
              processedTypes = altData;
            } else if (altData && Array.isArray(altData.result)) {
              processedTypes = altData.result;
            } else if (altData && Array.isArray(altData.data)) {
              processedTypes = altData.data;
            } else {
              throw new Error('Không tìm thấy dữ liệu type từ endpoint thay thế');
            }
          } catch (altErr) {
            console.error('>> LỖI KHI THỬ ENDPOINT TYPE THAY THẾ:', altErr);
          }
        }
        
        // Đảm bảo mỗi loại sân có typeId
        processedTypes = processedTypes.map(type => ({
          ...type,
          typeId: type.typeId || type.id // Hỗ trợ cả hai trường hợp 
        }));
        
        console.log('>> Dữ liệu loại sân đã xử lý:', processedTypes);
        setTypes(processedTypes);
      } catch (err) {
        console.error('>> LỖI KHI GỌI API TYPES:', err);
        setError(prevError => prevError || `Không thể tải loại sân. Lỗi: ${err.message}`);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Lỗi tổng quát khi tải dữ liệu:', err);
      setError(`Không thể tải dữ liệu. Lỗi: ${err.message}. Vui lòng đảm bảo backend đang chạy.`);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Đã lọc tự động khi searchTerm thay đổi
  };

  // Lọc sân theo tìm kiếm và type đã chọn
  const filteredStadiums = useMemo(() => {
    return stadiums.filter(stadium => {
      const nameMatch = stadium.stadiumName && stadium.stadiumName.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = !selectedType || stadium.typeId === selectedType;
      return nameMatch && typeMatch;
    });
  }, [stadiums, searchTerm, selectedType]);
  
  // Đếm số lượng sân theo từng loại
  const getStadiumCountByType = (typeId) => {
    return stadiums.filter(stadium => stadium.typeId === typeId).length;
  };
  
  // Lấy tên loại sân từ typeId
  const getTypeName = (typeId) => {
    const type = types.find(t => t.typeId === typeId);
    return type ? type.typeName : `Loại sân ID: ${typeId}`;
  };
  
  // Lấy tên sân - từ API field là "stadiumName"
  const getStadiumName = (stadium) => {
    return stadium.stadiumName || stadium.name || "Sân bóng";
  };
  
  // Lấy thông tin địa điểm từ locationId hoặc location object
  const getLocationName = (stadium) => {
    // Kiểm tra các trường hợp có thể trong API
    console.log('>> Trích xuất location name cho stadium:', stadium.stadiumId || stadium.id);
    
    // Trường hợp thuộc tính đã được trích xuất trực tiếp
    if (stadium.locationName) return stadium.locationName;
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      console.log('>> Stadium có object location:', stadium.location);
      if (stadium.location.name) return stadium.location.name;
      if (stadium.location.locationName) return stadium.location.locationName;
      if (stadium.location.location_name) return stadium.location.location_name;
    }
    
    // Trường hợp trả về trực tiếp
    if (stadium.location_name) return stadium.location_name;
    
    return "Chưa cập nhật tên địa điểm";
  };
  
  const getLocationAddress = (stadium) => {
    // Trường hợp thuộc tính đã được trích xuất trực tiếp
    if (stadium.address) return stadium.address;
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      if (stadium.location.address) return stadium.location.address;
      if (stadium.location.locationAddress) return stadium.location.locationAddress;
    }
    
    // Trường hợp trả về trực tiếp
    if (stadium.locationAddress) return stadium.locationAddress;
    
    return "Chưa cập nhật địa chỉ";
  };
  
  const getDistrict = (stadium) => {
    // Trường hợp thuộc tính đã được trích xuất trực tiếp
    if (stadium.district) return stadium.district;
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      if (stadium.location.district) return stadium.location.district;
    }
    
    return "Chưa cập nhật quận/huyện";
  };
  
  const getCity = (stadium) => {
    // Trường hợp thuộc tính đã được trích xuất trực tiếp
    if (stadium.city) return stadium.city;
    
    // Nếu có location object
    if (stadium.location && typeof stadium.location === 'object') {
      if (stadium.location.city) return stadium.location.city;
    }
    
    return "Chưa cập nhật thành phố";
  };
  
  // Lấy giá sân từ API
  const getStadiumPrice = (stadium) => {
    // Nếu có thông tin price, hiển thị theo định dạng VND
    if (stadium.price) {
      // Sử dụng toLocaleString để định dạng số tiền theo tiền tệ Việt Nam
      return `${stadium.price.toLocaleString('vi-VN')} VNĐ/giờ`;
    }
    
    // Trường hợp không có thông tin giá
    return "Liên hệ để biết giá";
  };
  
  // Lấy hình ảnh từ API nếu có, ngược lại dùng ảnh mặc định
  const getStadiumImage = (stadium) => {
    // URL cố định đến backend
    const BASE_URL = 'http://localhost:8080';
    
    // Lấy stadiumId từ stadium
    const stadiumId = stadium.stadiumId || stadium.id;
    
    // Kiểm tra nếu có ảnh trong stadiumImages
    if (stadiumImages[stadiumId]) {
      const imageUrl = stadiumImages[stadiumId];
      
      // Log chi tiết để debug
      console.log(`>> DEBUG imageUrl cho sân ${stadiumId}: ${imageUrl}`);
      
      // Kiểm tra xem imageUrl đã có đường dẫn đầy đủ chưa
      if (imageUrl.startsWith('http')) {
        console.log(`>> Sử dụng URL đầy đủ: ${imageUrl}`);
        return imageUrl;
      }
      
      // Đảm bảo đường dẫn có dấu / ở giữa BASE_URL và imageUrl
      const fullUrl = `${BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      console.log(`>> Tạo URL đầy đủ: ${fullUrl}`);
      
      // Thử truy cập trực tiếp vào ảnh từ uploads folder
      return fullUrl;
    }
    
    // Không trả về gì nếu không có ảnh
    console.log(`>> Không tìm thấy ảnh cho sân ${stadiumId}`);
    return "";
  };

  // Kiểm tra trạng thái sân
  const getStadiumStatus = (stadium) => {
    // Kiểm tra status nếu có
    if (stadium.status) {
      // Chuẩn hóa status: available, booked, maintenance
      const status = stadium.status.toLowerCase();
      
      if (status === 'available' || status === '1' || status === 'true') {
        return 'AVAILABLE';
      } else if (status === 'maintenance') {
        return 'MAINTENANCE';
      } else {
        return 'BOOKED';
      }
    }
    
    // Kiểm tra các trường có thể chứa thông tin trạng thái khác
    if (stadium.available === false || stadium.isAvailable === false) {
      return 'BOOKED';
    }
    
    // Trường hợp không có thông tin trạng thái, mặc định là có sẵn
    return 'AVAILABLE';
  };
  
  // Lấy biểu tượng cho mỗi loại sân
  const getTypeIcon = (typeName) => {
    if (!typeName) return faFutbol;
    
    // Kiểm tra xem có cài đặt tùy chỉnh không
    if (typeStyleSettings[typeName] && typeStyleSettings[typeName].icon) {
      const iconName = typeStyleSettings[typeName].icon;
      const iconObj = availableIcons.find(i => i.name === iconName);
      if (iconObj) return iconObj.icon;
    }
    
    // Logic mặc định dựa vào tên
    const name = typeName.toLowerCase();
    if (name.includes('bóng đá') || name.includes('football')) {
      return faFutbol;
    } else if (name.includes('bóng rổ') || name.includes('basketball')) {
      return faBasketballBall;
    } else if (name.includes('bóng chuyền') || name.includes('volleyball')) {
      return faVolleyballBall;
    } else if (name.includes('cầu lông') || name.includes('badminton')) {
      return faTableTennis;
    }
    
    return faFutbol; // Icon mặc định
  };

  // Lấy màu cho mỗi loại sân
  const getTypeColor = (typeName) => {
    if (!typeName) return "#1a4297"; // Màu mặc định
    
    // Kiểm tra xem có cài đặt tùy chỉnh không
    if (typeStyleSettings[typeName] && typeStyleSettings[typeName].color) {
      return typeStyleSettings[typeName].color;
    }
    
    // Logic mặc định dựa vào tên
    const name = typeName.toLowerCase();
    if (name.includes('bóng đá')) {
      return "#28a745"; // Màu xanh lá
    } else if (name.includes('bóng rổ')) {
      return "#fd7e14"; // Màu cam
    } else if (name.includes('bóng chuyền')) {
      return "#dc3545"; // Màu đỏ
    } else if (name.includes('cầu lông')) {
      return "#6f42c1"; // Màu tím
    }
    
    return "#1a4297"; // Màu mặc định
  };

  // Hiển thị dropdown chọn loại sân
  const renderTypeFilter = () => (
    <div className="filter-section">
      <h3 className="filter-title">Loại sân</h3>
      <div className="type-filter-list">
        <div 
          className={`type-filter-item ${selectedType === '' ? 'active' : ''}`}
          onClick={() => setSelectedType('')}
          style={selectedType === '' ? {backgroundColor: "#1a4297"} : {}}
        >
          <div className="type-filter-content">
            <span className="type-icon" style={{backgroundColor: "rgba(26, 66, 151, 0.1)", color: "#1a4297"}}>
              <FontAwesomeIcon icon={faFutbol} />
            </span>
            <span className="type-name">Tất cả</span>
            <span className="type-count">{stadiums.length}</span>
          </div>
        </div>
        
        {types.map((type, index) => {
          const typeColor = getTypeColor(type.typeName);
          // Giả định loại sân thứ 3 là mới
          const isNewType = index === 2;
          
          return (
            <div 
              key={type.typeId} 
              className={`type-filter-item ${selectedType === type.typeId ? 'active' : ''}`}
              onClick={() => setSelectedType(type.typeId)}
              style={selectedType === type.typeId ? {backgroundColor: typeColor, borderColor: typeColor} : {}}
            >
              {isNewType && <span className="type-new-badge">Mới</span>}
              <div className="type-filter-content">
                <span 
                  className="type-icon" 
                  style={{
                    backgroundColor: selectedType === type.typeId ? 
                                    "rgba(255, 255, 255, 0.25)" : 
                                    `${typeColor}20`, // 20% opacity
                    color: selectedType === type.typeId ? "#fff" : typeColor
                  }}
                >
                  <FontAwesomeIcon icon={getTypeIcon(type.typeName)} />
                </span>
                <span className="type-name">{type.typeName}</span>
                <span 
                  className="type-count"
                  style={selectedType === type.typeId ? 
                        {backgroundColor: "#fff", color: typeColor} : 
                        {backgroundColor: `${typeColor}15`, color: typeColor}}
                >
                  {getStadiumCountByType(type.typeId)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render một stadium card với thông tin đầy đủ
  const renderStadiumCard = (stadium) => {
    console.log(`---------------------------------------------`);
    console.log(`>> Render stadium card cho sân ${stadium.stadiumId || stadium.id}`);
    console.log(`---------------------------------------------`);

    const imageUrl = getStadiumImage(stadium);
    
    return (
      <div className="stadium-card" key={stadium.stadiumId || stadium.id}>
        <div className={`stadium-image ${!imageUrl ? 'no-image' : ''}`}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={stadium.stadiumName || stadium.name}
            />
          ) : (
            <div className="no-image-placeholder"></div>
          )}
        </div>
        <div className="stadium-info">
          <h3>{stadium.stadiumName || stadium.name}</h3>
          
          <div className="location-info">
            <p className="location-name">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="location-icon" />
              <strong>{getLocationName(stadium)}</strong>
            </p>
            
            <p className="address">
              <FontAwesomeIcon icon={faLocationArrow} className="address-icon" />
              <span>{getLocationAddress(stadium)} ({getDistrict(stadium)})</span>
            </p>
          </div>
          
          <div className="price-status">
            <span className="price">
              <FontAwesomeIcon icon={faMoneyBillWave} className="price-icon" />
              {getStadiumPrice(stadium)}
            </span>
            
            <span className={`status ${getStadiumStatus(stadium) === 'AVAILABLE' ? 'available' : 'booked'}`}>
              {getStadiumStatus(stadium) === 'AVAILABLE' ? (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="status-icon" />
                  Còn trống
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="status-icon" />
                  Đã đặt
                </>
              )}
            </span>
          </div>
          
          <div className="stadium-actions">
            <button className="booking-btn" onClick={() => navigate(`/stadium/${stadium.stadiumId || stadium.id}`)}>
              <FontAwesomeIcon icon={faInfoCircle} className="booking-icon" />
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stadium-list-page">
      <Navbar />
      
      <div className="main-content">
        <div className="container">
          <div className="page-stars">
            <span className="star filled"><FontAwesomeIcon icon={faStar} /></span>
          </div>
          <h1 className="page-title">Danh sách sân bãi</h1>
          <div className="title-underline"></div>
          
          <div className="content-wrapper">
            {/* Sidebar với danh sách loại sân từ API */}
            <aside className="sidebar">
              <div className="sidebar-section">
                <h3 className="sidebar-title">Danh sách sân bãi</h3>
                {renderTypeFilter()}
        </div>
            </aside>
            
            {/* Main content */}
            <div className="content-area">
              {/* Stadium grid */}
              {loading && (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Đang tải danh sách sân bóng...</p>
              </div>
              )}
              
              {error && !loading && (
                <div className="error-message">
                  <p>{error}</p>
                  <button 
                    onClick={fetchData}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: '#1a4297',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thử lại
                  </button>
                </div>
              )}
              
              {!loading && filteredStadiums.length === 0 && !error && (
              <div className="no-results">
                  <p>Không tìm thấy sân bóng nào phù hợp với tìm kiếm của bạn.</p>
                  <button 
                    onClick={fetchData}
                    style={{
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: '#1a4297',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Thử lại
                  </button>
              </div>
            )}
            
              {!loading && filteredStadiums.length > 0 && (
            <div className="stadium-grid">
              {filteredStadiums.map(stadium => (
                    renderStadiumCard(stadium)
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StadiumListPage;
