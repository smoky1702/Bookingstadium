import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CSpinner,
  CBadge,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheck, cilX } from '@coreui/icons';
import { stadiumAPI, typeAPI, locationAPI } from '../services/adminApi';

const StadiumApprovalManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingStadiums, setPendingStadiums] = useState([]);
  const [showStadiumModal, setShowStadiumModal] = useState(false);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [stadiumAction, setStadiumAction] = useState(null);
  const [ownerMap, setOwnerMap] = useState({});
  
  // Hàm lấy tên chủ sân từ userId
  const getOwnerName = (userId) => {
    if (!userId) return 'Không xác định';
    const owner = ownerMap[userId];
    if (!owner) return 'Chủ sân #' + userId;
    return `${owner.firstname || ''} ${owner.lastname || ''}`.trim() || owner.email || 'Không xác định';
  };

  useEffect(() => {
    fetchPendingStadiums();
  }, []);

  const fetchPendingStadiums = async () => {
    setLoading(true);
    try {
      // Lấy danh sách sân
      const stadiumResponse = await stadiumAPI.getAllStadiums();
      console.log('All stadiums:', stadiumResponse.data?.result);
      
      // Lấy danh sách loại sân
      const typeResponse = await typeAPI.getTypes();
      const typeData = typeResponse.data?.result || [];
      const typeMap = {};
      typeData.forEach(type => {
        typeMap[type.typeId || type.type_id] = type.typeName || type.type_name;
      });
      
      // Lấy danh sách địa điểm
      const locationResponse = await locationAPI.getAllLocations();
      const locationData = locationResponse.data?.result || [];
      const locationMap = {};
      const tempOwnerMap = {};
      
      locationData.forEach(location => {
        const locId = location.locationId || location.location_id;
        const userId = location.userId || location.user_id;
        
        locationMap[locId] = {
          name: location.locationName || location.location_name,
          userId: userId
        };
        
        // Tạo mapping đơn giản cho chủ sân (chỉ để hiển thị tên)
        if (userId && location.owner) {
          tempOwnerMap[userId] = location.owner;
        }
      });
      
      setOwnerMap(tempOwnerMap);
      
      // Lọc ra chỉ các stadium có status là INACTIVE (chờ duyệt)
      const pendingStadiumsData = stadiumResponse.data?.result
        ? stadiumResponse.data.result.filter(stadium => {
            // Kiểm tra nhiều trường hợp của status
            const stadiumStatus = stadium.status;
            return stadiumStatus === 'INACTIVE' || 
                   stadiumStatus === 0 || 
                   stadiumStatus === 'PENDING';
          }).map(stadium => {
            // Xác định ownerId từ stadium hoặc từ location
            const typeId = stadium.typeId || stadium.type_id;
            const locationId = stadium.locationId || stadium.location_id;
            const stadiumOwnerId = stadium.ownerId || stadium.owner_id;
            const locationInfo = locationId ? locationMap[locationId] : null;
            const locationOwnerId = locationInfo?.userId;
            
            // Ưu tiên lấy ownerId từ stadium, nếu không có thì lấy từ location
            const ownerId = stadiumOwnerId || locationOwnerId;
            
            return {
              ...stadium,
              type_name: typeMap[typeId] || 'Chưa phân loại',
              location_name: locationInfo?.name || 'Không có thông tin',
              owner_id: ownerId,
              owner_name: ownerId ? getOwnerName(ownerId) : 'Không xác định'
            };
          })
        : [];
      
      console.log('Filtered pending stadiums with details:', pendingStadiumsData);
      setPendingStadiums(pendingStadiumsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending stadiums:', err);
      setError('Không thể tải danh sách sân chờ duyệt');
      setPendingStadiums([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStadium = (stadium) => {
    setSelectedStadium(stadium);
    setStadiumAction(null);
    setShowStadiumModal(true);
  };

  const handleApproveStadium = async () => {
    try {
      // Tạo StadiumUpdateRequest theo đúng cấu trúc yêu cầu từ backend
      const updateRequest = {
        type_id: selectedStadium.type_id || selectedStadium.typeId,
        stadium_name: selectedStadium.stadium_name || selectedStadium.stadiumName,
        price: selectedStadium.price,
        status: 'AVAILABLE', // Thay đổi từ INACTIVE sang AVAILABLE
        description: selectedStadium.description || ''
      };
      
      console.log('Approving stadium with request:', updateRequest);
      
      const stadiumId = selectedStadium.stadium_id || selectedStadium.stadiumId;
      const response = await stadiumAPI.updateStadium(stadiumId, updateRequest);
      
      console.log('Stadium approved successfully:', response.data);
      setStadiumAction('approved');
      fetchPendingStadiums();
    } catch (err) {
      console.error('Error approving stadium:', err);
      setStadiumAction('error');
    }
  };

  const handleRejectStadium = async () => {
    try {
      // Tạo StadiumUpdateRequest theo đúng cấu trúc yêu cầu từ backend
      const updateRequest = {
        type_id: selectedStadium.type_id || selectedStadium.typeId,
        stadium_name: selectedStadium.stadium_name || selectedStadium.stadiumName,
        price: selectedStadium.price,
        status: 'UNAVAILABLE', // Từ chối sân, đặt trạng thái UNAVAILABLE
        description: selectedStadium.description || ''
      };
      
      console.log('Rejecting stadium with request:', updateRequest);
      
      const stadiumId = selectedStadium.stadium_id || selectedStadium.stadiumId;
      const response = await stadiumAPI.updateStadium(stadiumId, updateRequest);
      
      console.log('Stadium rejected successfully:', response.data);
      setStadiumAction('rejected');
      fetchPendingStadiums();
    } catch (err) {
      console.error('Error rejecting stadium:', err);
      setStadiumAction('error');
    }
  };

  return (
    <>
      <CRow>
        <CCol>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Sân chờ duyệt</strong>
            </CCardHeader>
            <CCardBody>
              {error && (
                <CAlert color="danger" dismissible>
                  {error}
                </CAlert>
              )}
              
              {loading ? (
                <div className="text-center p-3">
                  <CSpinner color="primary" />
                </div>
              ) : (
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Tên sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Loại sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Địa điểm</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giá</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Chủ sân</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Thao tác</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {pendingStadiums.length > 0 ? (
                      pendingStadiums.map((stadium, index) => (
                        <CTableRow key={stadium.stadium_id || stadium.stadiumId}>
                          <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                          <CTableDataCell>{stadium.stadium_name || stadium.stadiumName}</CTableDataCell>
                          <CTableDataCell>{stadium.type_name || stadium.typeName || 'Chưa phân loại'}</CTableDataCell>
                          <CTableDataCell>{stadium.location_name || stadium.locationName || 'Không có thông tin'}</CTableDataCell>
                          <CTableDataCell>{(stadium.price || 0).toLocaleString()} VNĐ</CTableDataCell>
                          <CTableDataCell>{stadium.owner_name || stadium.ownerName || 'Không có thông tin'}</CTableDataCell>
                          <CTableDataCell>
                            <CButton 
                              color="info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleViewStadium(stadium)}
                            >
                              Xem chi tiết
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    ) : (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center">
                          Không có sân chờ duyệt
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal xem chi tiết và duyệt sân */}
      <CModal visible={showStadiumModal} onClose={() => setShowStadiumModal(false)} size="lg">
        <CModalHeader onClose={() => setShowStadiumModal(false)}>
          <CModalTitle>Chi tiết sân chờ duyệt</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedStadium && (
            <>
              {stadiumAction === 'approved' && (
                <CAlert color="success">
                  Sân đã được duyệt thành công!
                </CAlert>
              )}
              {stadiumAction === 'rejected' && (
                <CAlert color="warning">
                  Sân đã bị từ chối!
                </CAlert>
              )}
              {stadiumAction === 'error' && (
                <CAlert color="danger">
                  Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.
                </CAlert>
              )}

              <div className="mb-3">
                <h5>Thông tin sân</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th style={{ width: '35%' }}>ID:</th>
                      <td>{selectedStadium.stadium_id || selectedStadium.stadiumId}</td>
                    </tr>
                    <tr>
                      <th>Tên sân:</th>
                      <td>{selectedStadium.stadium_name || selectedStadium.stadiumName}</td>
                    </tr>
                    <tr>
                      <th>Loại sân:</th>
                      <td>{selectedStadium.type_name || selectedStadium.typeName || 'Chưa phân loại'}</td>
                    </tr>
                    <tr>
                      <th>Địa điểm:</th>
                      <td>{selectedStadium.location_name || selectedStadium.locationName || 'Không có thông tin'}</td>
                    </tr>
                    <tr>
                      <th>Giá:</th>
                      <td>{(selectedStadium.price || 0).toLocaleString()} VNĐ</td>
                    </tr>
                    <tr>
                      <th>Chủ sân:</th>
                      <td>
                        {selectedStadium.owner_name || selectedStadium.ownerName || 
                         (selectedStadium.ownerId ? `ID: ${selectedStadium.ownerId}` : 'Không có thông tin')}
                      </td>
                    </tr>
                    <tr>
                      <th>Trạng thái:</th>
                      <td><CBadge color="warning">Chờ duyệt</CBadge></td>
                    </tr>
                  </tbody>
                </table>
                <h5>Mô tả</h5>
                <p>{selectedStadium.description || 'Không có mô tả'}</p>
              </div>

              {!stadiumAction && (
                <div className="d-flex justify-content-end">
                  <CButton 
                    color="danger" 
                    className="me-2"
                    onClick={handleRejectStadium}
                  >
                    <CIcon icon={cilX} className="me-2" />
                    Từ chối
                  </CButton>
                  <CButton 
                    color="success"
                    onClick={handleApproveStadium}
                  >
                    <CIcon icon={cilCheck} className="me-2" />
                    Duyệt sân
                  </CButton>
                </div>
              )}
            </>
          )}
        </CModalBody>
      </CModal>
    </>
  );
};

export default StadiumApprovalManagement;
