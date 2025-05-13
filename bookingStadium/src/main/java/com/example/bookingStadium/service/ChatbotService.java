package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Chatbot.ChatbotRequest;
import com.example.bookingStadium.dto.response.Chatbot.ChatbotResponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.entity.Type_Of_Stadium;
import com.example.bookingStadium.entity.Stadium_Location;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import com.example.bookingStadium.repository.TypeRepository;
import com.example.bookingStadium.repository.StadiumLocationRepository;
import com.example.bookingStadium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import java.util.HashSet;
import java.util.Set;

@Service
public class ChatbotService {
    @Autowired
    private StadiumRepository stadiumRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private TypeRepository typeRepository;
    
    @Autowired
    private StadiumLocationRepository locationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;
    
    private final Map<Pattern, String> basicFAQs;
    
    public ChatbotService() {
        basicFAQs = new HashMap<>();
        initializeBasicFAQs();
    }
    
    public ChatbotResponse processQuery(ChatbotRequest request) {
        String query = request.getQuery().toLowerCase();
        String userId = request.getUserId();
        List<String> conversationContext = request.getConversationContext();
        String lastTopic = request.getLastTopic();
        
        // Xử lý câu hỏi phụ thuộc vào ngữ cảnh trước đó
        if (conversationContext != null && !conversationContext.isEmpty() && lastTopic != null) {
            // Xử lý câu hỏi tiếp theo dựa vào chủ đề trước đó
            if (query.length() < 15 && (
                    query.contains("đâu") || 
                    query.contains("bao nhiêu") || 
                    query.contains("khi nào") || 
                    query.contains("ở đâu") || 
                    query.contains("làm sao") || 
                    query.contains("vậy à") || 
                    query.contains("thế à") || 
                    query.contains("có") ||
                    query.contains("không") ||
                    query.matches(".*\\?$"))) {
                // Xử lý câu hỏi ngắn dựa vào ngữ cảnh
                if (lastTopic.equals("stadium_list") || lastTopic.equals("stadium")) {
                    return processStadiumQuery(query);
                } else if (lastTopic.equals("booking")) {
                    return processBookingQuery(query, userId);
                } else if (lastTopic.equals("location") || lastTopic.equals("location_list")) {
                    return processLocationQuery(query);
                } else if (lastTopic.equals("type") || lastTopic.equals("type_list")) {
                    return processTypeQuery(query);
                }
            }
        }
        
        // 0. Xử lý từ khóa đặc biệt
        if (query.contains("tạo tài khoản") || query.contains("đăng ký") || query.contains("tài khoản mới")) {
            String faqAnswer = findSpecificFAQAnswer("(cách|làm sao|làm thế nào)?.*(đăng ký|tạo tài khoản|tạo account|tạo tk|tài khoản mới|trở thành thành viên)");
            if (faqAnswer != null) {
                return ChatbotResponse.builder()
                        .answer(faqAnswer)
                        .sourceType("faq")
                        .build();
            }
        }
        
        // Xử lý câu hỏi về sân trống hiện tại
        if (query.contains("hôm nay") || query.contains("bây giờ") || query.contains("hiện tại")) {
            if (query.contains("sân") || query.contains("stadium") || query.contains("trống")) {
                return getAvailableStadiumsInfo();
            }
        }
        
        // 1. Kiểm tra câu hỏi thường gặp (FAQ)
        String faqAnswer = findFAQAnswer(query);
        if (faqAnswer != null) {
            return ChatbotResponse.builder()
                    .answer(faqAnswer)
                    .sourceType("faq")
                    .build();
        }
        
        // 2. Tìm kiếm thông tin cụ thể về đặt sân, sân bóng, v.v.
        if (containsKeywords(query, "đặt sân", "booking", "lịch đặt", "lịch", "đặt", "book", "đá bóng", "thuê sân")) {
            return processBookingQuery(query, userId);
        }
        
        if (containsKeywords(query, "sân", "stadium", "sân bóng", "giá")) {
            return processStadiumQuery(query);
        }
        
        if (containsKeywords(query, "khu vực", "location", "địa điểm", "địa chỉ")) {
            return processLocationQuery(query);
        }
        
        if (containsKeywords(query, "loại sân", "type", "5 người", "7 người", "11 người", "sân mini", "sân lớn", "sân vừa", "futsal", "sân 5", "sân 7", "sân 11")) {
            return processTypeQuery(query);
        }
        
        // 3. Xử lý câu hỏi về thông tin cá nhân
        if (containsKeywords(query, "của tôi", "tài khoản của tôi", "thông tin cá nhân", "profile", "hồ sơ")) {
            if (userId != null && !userId.isEmpty()) {
                Optional<Users> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent()) {
                    Users user = userOpt.get();
                    return ChatbotResponse.builder()
                            .answer("Thông tin tài khoản của bạn:\n" +
                                    "- Email: " + user.getEmail() + "\n" +
                                    "- Tên: " + user.getFirstname() + " " + user.getLastname() + "\n" +
                                    "Bạn có thể cập nhật thông tin cá nhân trong mục \"Tài khoản\" sau khi đăng nhập.")
                            .sourceType("user_info")
                            .sourceId(userId)
                            .build();
                }
            }
            return ChatbotResponse.builder()
                    .answer("Bạn cần đăng nhập để xem thông tin cá nhân. Nếu bạn đã đăng nhập, có thể có lỗi xảy ra khi truy vấn thông tin.")
                    .sourceType("user_info")
                    .build();
        }
        
        // 4. Xử lý câu hỏi về đánh giá
        if (containsKeywords(query, "đánh giá", "review", "feedback", "nhận xét", "comment", "rating", "sao")) {
            return ChatbotResponse.builder()
                    .answer("Bạn có thể đánh giá và để lại phản hồi sau khi sử dụng dịch vụ đặt sân tại Mi24/7:\n" +
                            "1. Đăng nhập vào tài khoản\n" +
                            "2. Vào mục 'Lịch sử đặt sân'\n" +
                            "3. Chọn lịch đặt sân đã hoàn thành\n" +
                            "4. Nhấn vào 'Đánh giá'\n" +
                            "5. Chọn số sao và viết nhận xét\n" +
                            "Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ và giúp người dùng khác có thêm thông tin.")
                    .sourceType("rating_info")
                    .build();
        }
        
        // 5. Xử lý câu hỏi về thanh toán
        if (containsKeywords(query, "thanh toán", "payment", "trả tiền", "phí", "chuyển khoản", "card", "thẻ", "visa", "mastercard", "banking", "momo", "zalopay")) {
            return ChatbotResponse.builder()
                    .answer("Mi24/7 hỗ trợ các phương thức thanh toán:\n" +
                            "1. Thanh toán trực tiếp tại sân\n" +
                            "2. Ví điện tử (Momo)\n")
                    .sourceType("payment_info")
                    .build();
        }
        
        // 6. Trả về câu trả lời mặc định nếu không tìm thấy thông tin
        return ChatbotResponse.builder()
                .answer("Xin lỗi, tôi không có thông tin về câu hỏi của bạn. Bạn có thể thử hỏi về cách đặt sân, thông tin sân bóng, hoặc các câu hỏi thường gặp khác.")
                .sourceType("default")
                .build();
    }
    
    private String findFAQAnswer(String query) {
        String bestAnswer = null;
        double highestSimilarity = 0.3; // Ngưỡng tối thiểu để coi là tương đồng
        
        // Kiểm tra theo regex trước (cách cũ)
        for (Map.Entry<Pattern, String> entry : basicFAQs.entrySet()) {
            Pattern pattern = entry.getKey();
            Matcher matcher = pattern.matcher(query);
            if (matcher.find()) {
                return entry.getValue();
            }
            
            // Nếu không khớp regex, thử tính độ tương đồng
            double similarity = calculateSimilarity(query, pattern.pattern()
                    .replaceAll("[()\\[\\]{}|+*?^$\\\\]", "")); // Loại bỏ ký tự đặc biệt của regex
            
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestAnswer = entry.getValue();
            }
        }
        
        return bestAnswer;
    }
    
    /**
     * Tìm câu trả lời cho pattern cụ thể trong FAQ
     * @param patternStr Biểu thức chính quy để tìm
     * @return Câu trả lời từ FAQ nếu tìm thấy, null nếu không
     */
    private String findSpecificFAQAnswer(String patternStr) {
        Pattern pattern = Pattern.compile(patternStr);
        for (Map.Entry<Pattern, String> entry : basicFAQs.entrySet()) {
            if (pattern.pattern().equals(entry.getKey().pattern())) {
                return entry.getValue();
            }
        }
        return null;
    }
    
    private void initializeBasicFAQs() {
        // Đăng ký và đăng nhập
        basicFAQs.put(Pattern.compile("(cách|làm sao|làm thế nào)?.*(đăng ký|tạo tài khoản)"), 
            "Để đăng ký tài khoản Mi24/7, bạn cần thực hiện các bước sau:\n" +
            "1. Truy cập trang chủ Mi24/7\n" +
            "2. Nhấn vào nút \"Đăng ký\"\n" +
            "3. Điền đầy đủ thông tin cá nhân\n" +
            "4. Xác nhận email\n" +
            "5. Hoàn tất đăng ký");
            
        basicFAQs.put(Pattern.compile("(cách|làm sao|làm thế nào)?.*(đăng nhập|login)"), 
            "Để đăng nhập vào tài khoản Mi24/7:\n" +
            "1. Truy cập trang chủ Mi24/7\n" +
            "2. Nhấn vào nút \"Đăng nhập\"\n" +
            "3. Nhập email và mật khẩu\n" +
            "4. Nhấn \"Đăng nhập\"");
            
        basicFAQs.put(Pattern.compile("(quên|mất|reset|thay đổi).*(mật khẩu|password)"), 
            "Để lấy lại mật khẩu đã quên:\n" +
            "1. Truy cập trang đăng nhập\n" +
            "2. Nhấn vào \"Quên mật khẩu\"\n" +
            "3. Nhập email đã đăng ký\n" +
            "4. Làm theo hướng dẫn trong email được gửi tới bạn");
        
        // Tìm kiếm và đặt sân
        basicFAQs.put(Pattern.compile("(cách|làm sao|làm thế nào)?.*(tìm|tìm kiếm).*(sân|sân bóng|stadium)"), 
            "Để tìm kiếm sân bóng trên Mi24/7:\n" +
            "1. Truy cập trang chủ\n" +
            "2. Sử dụng bộ lọc tìm kiếm (khu vực, loại sân, giá tiền)\n" +
            "3. Hoặc nhập tên sân vào ô tìm kiếm\n" +
            "4. Xem kết quả và lựa chọn sân phù hợp");
            
        basicFAQs.put(Pattern.compile("(cách|làm sao|làm thế nào)?.*(đặt|booking|đặt chỗ).*(sân|sân bóng|stadium)"), 
            "Quy trình đặt sân trên Mi24/7:\n" +
            "1. Tìm và chọn sân bóng mong muốn\n" +
            "2. Chọn ngày và khung giờ trống\n" +
            "3. Điền thông tin đặt sân\n" +
            "4. Tiến hành thanh toán\n" +
            "5. Nhận xác nhận đặt sân qua email");
            
        // Thanh toán và hoàn tiền
        basicFAQs.put(Pattern.compile("(cách|hình thức|phương thức).*(thanh toán|payment|trả tiền)"), 
            "Mi24/7 hỗ trợ các phương thức thanh toán:\n" +
                    "1. Thanh toán trực tiếp tại sân\n" +
                    "2. Ví điện tử (Momo)\n");
            
        basicFAQs.put(Pattern.compile("(chính sách|cách|làm sao|làm thế nào)?.*(hủy|đổi|hoàn tiền|hoàn phí|refund)"), 
            "Chính sách hủy/đổi và hoàn tiền:\n" +
            "1. Hủy trước 24h: hoàn tiền 100%\n" +
            "2. Hủy trước 12h: hoàn tiền 50%\n" +
            "3. Hủy trước 6h: hoàn tiền 30%\n" +
            "4. Hủy trong vòng 6h: không hoàn tiền\n" +
            "Để hủy đặt sân, vào mục Quản lý đặt sân > chọn lịch đặt > Hủy đặt sân");
            
        // Các vấn đề khác
        basicFAQs.put(Pattern.compile("(liên hệ|contact|hỗ trợ|support|trợ giúp|help)"), 
            "Bạn có thể liên hệ Mi24/7 qua các kênh:\n" +
            "- Hotline: 0987.654.321 (8:00 - 22:00 hàng ngày)\n" +
            "- Email: support@mi247.com\n" +
            "- Chat trực tuyến trên website\n" +
            "- Fanpage Facebook: Mi247 Booking");
    }
    
    private boolean containsKeywords(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword.toLowerCase())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Tokenize câu hỏi thành các từ riêng biệt và kiểm tra xem có chứa từ khóa không
     * Cải thiện việc tìm kiếm từ khóa trong câu hỏi phức tạp
     */
    private List<String> tokenize(String text) {
        List<String> tokens = new ArrayList<>();
        // Tách câu thành các từ, loại bỏ dấu câu
        String[] words = text.toLowerCase()
                .replaceAll("[,.?!:;()\\[\\]{}]", " ")
                .split("\\s+");
        
        for (String word : words) {
            if (!word.isEmpty()) {
                tokens.add(word);
            }
        }
        return tokens;
    }
    
    /**
     * Tính toán độ tương đồng của câu hỏi với mẫu
     * @return giá trị từ 0.0 đến 1.0, càng cao càng tương đồng
     */
    private double calculateSimilarity(String query, String pattern) {
        List<String> queryTokens = tokenize(query);
        List<String> patternTokens = tokenize(pattern);
        
        int matches = 0;
        for (String token : queryTokens) {
            if (patternTokens.contains(token)) {
                matches++;
            }
        }
        
        // Tính độ tương đồng Jaccard
        Set<String> union = new HashSet<>(queryTokens);
        union.addAll(patternTokens);
        
        return union.isEmpty() ? 0 : (double) matches / union.size();
    }
    
    private ChatbotResponse processBookingQuery(String query, String userId) {
        // Trả về thông tin đặt sân của người dùng hiện tại
        if (userId != null && !userId.isEmpty() && 
            containsKeywords(query, "của tôi", "tôi đã đặt", "lịch của tôi", "lịch sắp tới")) {
            
            List<Booking> userBookings = bookingRepository.findByUserId(userId);
            if (userBookings.isEmpty()) {
                return ChatbotResponse.builder()
                        .answer("Bạn chưa có lịch đặt sân nào.")
                        .sourceType("booking")
                        .build();
            }
            
            StringBuilder response = new StringBuilder("Lịch đặt sân của bạn:\n");
            int count = 0;
            for (Booking booking : userBookings) {
                if (count++ >= 3) {
                    response.append("...\nVà các lịch đặt sân khác. Vui lòng truy cập mục Quản lý đặt sân để xem chi tiết.");
                    break;
                }
                
                // Tìm thông tin chi tiết booking để lấy stadiumId
                StadiumBookingDetail detail = stadiumBookingDetailRepository.findByBookingId(booking.getBookingId());
                Stadium stadium = null;
                if (detail != null) {
                    stadium = stadiumRepository.findById(detail.getStadiumId()).orElse(null);
                }
                
                String stadiumName = stadium != null ? stadium.getStadiumName() : "Sân bóng";
                
                response.append("- Ngày: ")
                       .append(booking.getDateOfBooking())
                       .append(", Giờ: ")
                       .append(booking.getStartTime())
                       .append(" - ")
                       .append(booking.getEndTime())
                       .append(", Sân: ")
                       .append(stadiumName)
                       .append(", Trạng thái: ")
                       .append(booking.getStatus())
                       .append("\n");
            }
            
            return ChatbotResponse.builder()
                    .answer(response.toString())
                    .sourceType("booking")
                    .sourceId(userId)
                    .build();
        }
        
        // Xử lý tìm kiếm sân trống theo khung giờ và ngày
        if (containsKeywords(query, "tìm sân trống", "sân nào trống", "đặt sân", "khung giờ", "giờ nào", "ngày nào")) {
            // Trích xuất thông tin về ngày và giờ từ câu hỏi
            // Đây là xử lý đơn giản, thực tế cần NLP phức tạp hơn
            String date = extractDate(query);
            String timeSlot = extractTimeSlot(query);
            
            if (date != null || timeSlot != null) {
                StringBuilder response = new StringBuilder("Theo yêu cầu tìm kiếm");
                if (date != null) {
                    response.append(" ngày ").append(date);
                }
                if (timeSlot != null) {
                    response.append(" khung giờ ").append(timeSlot);
                }
                response.append(", các sân sau còn trống:\n\n");
                
                // Đây là nơi thực tế sẽ truy vấn database tìm sân trống
                // Trong ví dụ này, chúng ta sẽ trả về các sân có sẵn
                List<Stadium> availableStadiums = stadiumRepository.findAll().stream()
                        .filter(s -> s.getStatus().name().equals("AVAILABLE"))
                        .limit(3)
                        .toList();
                
                if (availableStadiums.isEmpty()) {
                    return ChatbotResponse.builder()
                            .answer("Xin lỗi, không tìm thấy sân trống phù hợp với yêu cầu của bạn. Vui lòng thử lại với thời gian khác.")
                            .sourceType("stadium_search")
                            .build();
                }
                
                for (Stadium stadium : availableStadiums) {
                    Type_Of_Stadium type = typeRepository.findById(stadium.getTypeId()).orElse(null);
                    Stadium_Location location = locationRepository.findById(stadium.getLocationId()).orElse(null);
                    
                    String typeInfo = type != null ? " (" + type.getTypeName() + ")" : "";
                    String locationInfo = location != null ? " - " + location.getLocationName() : "";
                    
                    response.append("- ")
                           .append(stadium.getStadiumName())
                           .append(typeInfo)
                           .append(locationInfo)
                           .append(": ")
                           .append(stadium.getPrice())
                           .append(" VND/giờ\n");
                }
                
                response.append("\nBạn có thể đặt sân bằng cách nhấn vào sân muốn đặt và chọn thời gian cụ thể.");
                
                return ChatbotResponse.builder()
                        .answer(response.toString())
                        .sourceType("stadium_search")
                        .build();
            }
        }
        
        // Hướng dẫn cách đặt sân
        return ChatbotResponse.builder()
                .answer("Để đặt sân bóng trên Mi24/7, bạn cần thực hiện các bước sau:\n" +
                        "1. Đăng nhập vào tài khoản\n" +
                        "2. Tìm kiếm sân bóng phù hợp theo khu vực, loại sân\n" +
                        "3. Chọn ngày và khung giờ trống\n" +
                        "4. Xác nhận thông tin đặt sân\n" +
                        "5. Thanh toán\n" +
                        "6. Nhận xác nhận đặt sân thành công qua email\n\n" +
                        "Bạn có thể quản lý lịch đặt sân trong mục \"Quản lý đặt sân\" sau khi đăng nhập.")
                .sourceType("guide")
                .build();
    }
    
    /**
     * Trích xuất thông tin ngày từ câu hỏi
     */
    private String extractDate(String query) {
        // Xử lý ngày "hôm nay", "ngày mai", "ngày kia"
        if (query.contains("hôm nay")) {
            return "hôm nay";
        } else if (query.contains("ngày mai") || query.contains("mai")) {
            return "ngày mai";
        } else if (query.contains("ngày kia")) {
            return "ngày kia";
        }
        
        // Xử lý thứ trong tuần
        if (query.contains("thứ 2") || query.contains("thứ hai")) {
            return "thứ 2";
        } else if (query.contains("thứ 3") || query.contains("thứ ba")) {
            return "thứ 3";
        } else if (query.contains("thứ 4") || query.contains("thứ tư")) {
            return "thứ 4";
        } else if (query.contains("thứ 5") || query.contains("thứ năm")) {
            return "thứ 5";
        } else if (query.contains("thứ 6") || query.contains("thứ sáu")) {
            return "thứ 6";
        } else if (query.contains("thứ 7") || query.contains("thứ bảy")) {
            return "thứ 7";
        } else if (query.contains("chủ nhật") || query.contains("cn")) {
            return "chủ nhật";
        }
        
        // Logic phức tạp hơn có thể thêm vào đây để xử lý định dạng ngày/tháng
        return null;
    }
    
    /**
     * Trích xuất khung giờ từ câu hỏi
     */
    private String extractTimeSlot(String query) {
        // Xử lý các khung giờ phổ biến
        if (query.contains("sáng")) {
            return "buổi sáng (6:00 - 12:00)";
        } else if (query.contains("trưa")) {
            return "buổi trưa (12:00 - 14:00)";
        } else if (query.contains("chiều")) {
            return "buổi chiều (14:00 - 18:00)";
        } else if (query.contains("tối")) {
            return "buổi tối (18:00 - 23:00)";
        }
        
        // Logic phức tạp hơn có thể thêm vào đây để xử lý các khoảng giờ cụ thể
        return null;
    }
    
    private ChatbotResponse processStadiumQuery(String query) {
        // Tìm kiếm thông tin về một sân cụ thể nếu có nhắc đến tên
        List<Stadium> allStadiums = stadiumRepository.findAll();
        for (Stadium stadium : allStadiums) {
            if (query.contains(stadium.getStadiumName().toLowerCase())) {
                Type_Of_Stadium type = typeRepository.findById(stadium.getTypeId()).orElse(null);
                Stadium_Location location = locationRepository.findById(stadium.getLocationId()).orElse(null);
                
                String typeInfo = type != null ? type.getTypeName() : "Không có thông tin";
                String locationInfo = location != null ? location.getLocationName() : "Không có thông tin";
                
                return ChatbotResponse.builder()
                        .answer("Thông tin sân " + stadium.getStadiumName() + ":\n" +
                                "- Loại sân: " + typeInfo + "\n" +
                                "- Địa điểm: " + locationInfo + "\n" +
                                "- Giá: " + stadium.getPrice() + " VND/giờ\n" +
                                "- Mô tả: " + stadium.getDescription() + "\n" +
                                "- Trạng thái: " + stadium.getStatus())
                        .sourceType("stadium")
                        .sourceId(stadium.getStadiumId())
                        .build();
            }
        }
        
        // Cung cấp thông tin chung về sân bóng
        List<Stadium> availableStadiums = new ArrayList<>();
        for (Stadium stadium : allStadiums) {
            if (stadium.getStatus().name().equals("AVAILABLE")) {
                availableStadiums.add(stadium);
            }
        }
        
        StringBuilder response = new StringBuilder("Hiện tại Mi24/7 có " + availableStadiums.size() + " sân bóng đang hoạt động.\n");
        if (containsKeywords(query, "giá")) {
            response.append("Giá thuê sân dao động từ ")
                   .append(getMinPrice(allStadiums))
                   .append(" đến ")
                   .append(getMaxPrice(allStadiums))
                   .append(" VND/giờ tùy theo loại sân và khu vực.\n");
        }
        
        response.append("Một số sân tiêu biểu:\n");
        int count = 0;
        for (Stadium stadium : availableStadiums) {
            if (count++ >= 3) break;
            
            response.append("- ")
                   .append(stadium.getStadiumName())
                   .append(": ")
                   .append(stadium.getPrice())
                   .append(" VND/giờ\n");
        }
        
        response.append("\nBạn có thể tìm kiếm sân theo khu vực, loại sân hoặc tên sân cụ thể.");
        
        return ChatbotResponse.builder()
                .answer(response.toString())
                .sourceType("stadium_list")
                .build();
    }
    
    private double getMinPrice(List<Stadium> stadiums) {
        if (stadiums.isEmpty()) return 0;
        double min = Double.MAX_VALUE;
        for (Stadium stadium : stadiums) {
            if (stadium.getPrice() < min) {
                min = stadium.getPrice();
            }
        }
        return min;
    }
    
    private double getMaxPrice(List<Stadium> stadiums) {
        if (stadiums.isEmpty()) return 0;
        double max = 0;
        for (Stadium stadium : stadiums) {
            if (stadium.getPrice() > max) {
                max = stadium.getPrice();
            }
        }
        return max;
    }
    
    private ChatbotResponse processLocationQuery(String query) {
        // Tìm kiếm thông tin về một địa điểm cụ thể
        List<Stadium_Location> allLocations = locationRepository.findAll();
        for (Stadium_Location location : allLocations) {
            if (query.contains(location.getLocationName().toLowerCase())) {
                List<Stadium> stadiumsInLocation = stadiumRepository.findByLocationId(location.getLocationId());
                
                StringBuilder response = new StringBuilder("Thông tin khu vực " + location.getLocationName() + ":\n");
                response.append("- Địa chỉ: " + location.getAddress() + "\n");
                response.append("- Thông tin: " + location.getCity() + ", " + location.getDistrict() + "\n");
                response.append("- Số lượng sân: " + stadiumsInLocation.size() + "\n\n");
                
                if (!stadiumsInLocation.isEmpty()) {
                    response.append("Các sân có tại địa điểm này:\n");
                    for (int i = 0; i < Math.min(3, stadiumsInLocation.size()); i++) {
                        Stadium stadium = stadiumsInLocation.get(i);
                        response.append("- " + stadium.getStadiumName() + ": " + stadium.getPrice() + " VND/giờ\n");
                    }
                    if (stadiumsInLocation.size() > 3) {
                        response.append("Và các sân khác...");
                    }
                }
                
                return ChatbotResponse.builder()
                        .answer(response.toString())
                        .sourceType("location")
                        .sourceId(location.getLocationId())
                        .build();
            }
        }
        
        // Cung cấp thông tin chung về các khu vực
        StringBuilder response = new StringBuilder("Mi24/7 có sân bóng tại các khu vực sau:\n");
        for (int i = 0; i < Math.min(5, allLocations.size()); i++) {
            Stadium_Location location = allLocations.get(i);
            response.append("- " + location.getLocationName() + "\n");
        }
        if (allLocations.size() > 5) {
            response.append("Và các khu vực khác.\n\n");
        }
        
        response.append("Bạn có thể tìm kiếm sân theo khu vực cụ thể hoặc theo địa chỉ gần bạn.");
        
        return ChatbotResponse.builder()
                .answer(response.toString())
                .sourceType("location_list")
                .build();
    }
    
    private ChatbotResponse processTypeQuery(String query) {
        // Tìm kiếm thông tin về một loại sân cụ thể
        List<Type_Of_Stadium> allTypes = typeRepository.findAll();
        
        for (Type_Of_Stadium type : allTypes) {
            if (query.contains(type.getTypeName().toLowerCase())) {
                return ChatbotResponse.builder()
                        .answer("Thông tin về loại sân " + type.getTypeName() + ":\n" +
                               "- Mô tả: Sân bóng " + type.getTypeName() + "\n" +
                               "- Các sân loại này thường có kích thước phù hợp cho " + type.getTypeName())
                        .sourceType("type")
                        .sourceId(String.valueOf(type.getTypeId()))
                        .build();
            }
        }
        
        // Cung cấp thông tin chung về các loại sân
        StringBuilder response = new StringBuilder("Mi24/7 cung cấp các loại sân bóng sau:\n");
        for (Type_Of_Stadium type : allTypes) {
            response.append("- " + type.getTypeName() + "\n");
        }
        
        response.append("\nMỗi loại sân có kích thước và đặc điểm phù hợp với số người chơi khác nhau. Bạn có thể chọn loại sân phù hợp khi đặt sân.");
        
        return ChatbotResponse.builder()
                .answer(response.toString())
                .sourceType("type_list")
                .build();
    }

    // Thêm phương thức mới để lấy thông tin sân trống
    private ChatbotResponse getAvailableStadiumsInfo() {
        // Lấy dữ liệu sân thực tế từ database
        List<Stadium> allStadiums = stadiumRepository.findAll();
        List<Stadium> availableStadiums = new ArrayList<>();
        
        for (Stadium stadium : allStadiums) {
            if (stadium.getStatus().name().equals("AVAILABLE")) {
                availableStadiums.add(stadium);
            }
        }
        
        if (availableStadiums.isEmpty()) {
            return ChatbotResponse.builder()
                    .answer("Hiện tại không có sân nào đang trống. Vui lòng kiểm tra lại sau hoặc chọn một thời điểm khác.")
                    .sourceType("stadium_status")
                    .build();
        }
        
        StringBuilder response = new StringBuilder("Hiện tại Mi24/7 có " + availableStadiums.size() + 
                " sân bóng đang hoạt động.\n");
        
        response.append("Một số sân tiêu biểu:\n");
        
        // Hiển thị tối đa 3 sân
        int count = 0;
        for (Stadium stadium : availableStadiums) {
            if (count++ >= 3) break;
            
            // Lấy thông tin loại sân
            Type_Of_Stadium type = null;
            try {
                type = typeRepository.findById(stadium.getTypeId()).orElse(null);
            } catch (Exception e) {
                // Xử lý nếu có lỗi
            }
            
            // Lấy thông tin địa điểm
            Stadium_Location location = null;
            try {
                location = locationRepository.findById(stadium.getLocationId()).orElse(null);
            } catch (Exception e) {
                // Xử lý nếu có lỗi
            }
            
            String typeInfo = type != null ? " (" + type.getTypeName() + ")" : "";
            String locationInfo = location != null ? " - " + location.getLocationName() : "";
            
            response.append("- ")
                   .append(stadium.getStadiumName())
                   .append(typeInfo)
                   .append(locationInfo)
                   .append(": ")
                   .append(stadium.getPrice())
                   .append(" VND/giờ\n");
        }
        
        response.append("\nBạn có thể tìm kiếm sân theo khu vực, loại sân hoặc tên sân cụ thể.");
        
        return ChatbotResponse.builder()
                .answer(response.toString())
                .sourceType("stadium_status")
                .build();
    }
} 