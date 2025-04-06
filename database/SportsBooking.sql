-- CREATE DATABASE SportsBooking;
-- USE SportsBooking;
-- CREATE DATABASE bookingdb3;
-- USE bookingdb3;

-- Bảng quản lý vai trò
-- CREATE TABLE Roles (
--     role_id INT PRIMARY KEY AUTO_INCREMENT,
--     role_name VARCHAR(50) NOT NULL
-- );

CREATE TABLE Roles (
    role_id VARCHAR(50) PRIMARY KEY
);

-- Bảng người dùng
CREATE TABLE Users (
    user_id CHAR(36) PRIMARY KEY,
    role_id varchar(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    day_of_birth DATE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

-- Bảng địa điểm sân
CREATE TABLE Stadium_Location (
    location_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    location_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50),
    district VARCHAR(50),
    longitude DECIMAL(10,7),
    latitude DECIMAL(10,7),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Bảng loại sân
CREATE TABLE Type_Of_Stadium (
    type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL
);


CREATE TABLE Stadium (
    stadium_id CHAR(36) PRIMARY KEY,
    location_id CHAR(36) NOT NULL,  -- Liên kết đến địa điểm
    type_id INT NOT NULL,           -- Liên kết đến loại sân
    stadium_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('AVAILABLE', 'MAINTENANCE', 'BOOKED') DEFAULT 'AVAILABLE',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    FOREIGN KEY (location_id) REFERENCES Stadium_Location(location_id),
    FOREIGN KEY (type_id) REFERENCES Type_Of_Stadium(type_id) 
);

-- Bảng đặt sân
CREATE TABLE Stadium_Booking (
    stadium_booking_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    location_id CHAR(36), -- Thêm thông tin địa điểm sân
    date_of_booking DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (start_time < end_time),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (location_id) REFERENCES Stadium_Location(location_id)
);

-- Bảng chi tiết đặt sân
CREATE TABLE Stadium_Booking_Details (
    stadium_booking_details_id CHAR(36) PRIMARY KEY,
    stadium_booking_id CHAR(36),
    type_id INT, -- Thêm type_id để xác định loại sân
    stadium_id CHAR(36),
    total_hours INT,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (stadium_booking_id) REFERENCES Stadium_Booking(stadium_booking_id),
    FOREIGN KEY (stadium_id) REFERENCES Stadium(stadium_id),
    FOREIGN KEY (type_id) REFERENCES Type_Of_Stadium(type_id) -- Tham chiếu đến bảng loại sân
);


-- Bảng sân vận động
-- CREATE TABLE Stadium (
--     stadium_id CHAR(36) PRIMARY KEY,
--     location_id CHAR(36),
--     type_id INT,
--     stadium_name VARCHAR(100) NOT NULL,
--     price DECIMAL(10,2) NOT NULL,
--     status ENUM('AVAILABLE', 'MAINTENANCE', 'BOOKED') DEFAULT 'AVAILABLE',
--     date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     description TEXT,
--     FOREIGN KEY (location_id) REFERENCES Stadium_Location(location_id),
--     FOREIGN KEY (type_id) REFERENCES Type_Of_Stadium(type_id)
-- );




-- Bảng phương thức thanh toán
CREATE TABLE Payment_Method (
    payment_method_id INT PRIMARY KEY AUTO_INCREMENT,
    payment_method_name VARCHAR(50) NOT NULL
);

-- Bảng hóa đơn
CREATE TABLE Bill (
    bill_id CHAR(36) PRIMARY KEY,
    stadium_booking_id CHAR(36),  -- Thay vì stadium_booking_details_id
    payment_method_id INT,
    user_id CHAR(36),
    final_price DECIMAL(10,2) NOT NULL CHECK (final_price >= 0),
    status ENUM('PAID', 'UNPAID', 'CANCELLED') DEFAULT 'UNPAID',
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_paid TIMESTAMP NULL, -- Thêm thời gian thanh toán
    FOREIGN KEY (stadium_booking_id) REFERENCES Stadium_Booking(stadium_booking_id),
    FOREIGN KEY (payment_method_id) REFERENCES Payment_Method(payment_method_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);




-- Bảng lịch sử đặt sân
-- CREATE TABLE Booking_History (
--     booking_history_id CHAR(36) PRIMARY KEY,
--     location_id CHAR(36),
--     user_id CHAR(36),
--     count INT NOT NULL,
--     FOREIGN KEY (location_id) REFERENCES Stadium_Location(location_id),
--     FOREIGN KEY (user_id) REFERENCES Users(user_id)
-- );

-- Bảng đánh giá
CREATE TABLE Evaluation (
    evaluation_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    stadium_id CHAR(36),
    rating_score DECIMAL(2,1) CHECK (rating_score >= 0 AND rating_score <= 5),
    comment TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (stadium_id) REFERENCES Stadium(stadium_id)
);

-- Bảng thông báo
CREATE TABLE Notification (
    notification_id CHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng lịch làm việc
CREATE TABLE Work_Schedule (
    work_schedule_id CHAR(36) PRIMARY KEY,
    location_id CHAR(36),
    day_of_the_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
    opening_hours TIME NOT NULL,
    closing_hours TIME NOT NULL,
    FOREIGN KEY (location_id) REFERENCES Stadium_Location(location_id)
);

-- Bảng log hệ thống
CREATE TABLE System_Log (
    system_log_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    action TEXT NOT NULL,
    date_action DATE NOT NULL,
    time TIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Bảng khuyến mãi
CREATE TABLE Promotion (
    promotion_id CHAR(36) PRIMARY KEY,
    user_id CHAR(36),
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    discount DECIMAL(5,2) CHECK (discount >= 0 AND discount <= 100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('ACTIVE', 'EXPIRED') DEFAULT 'ACTIVE',
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Image (
    image_id CHAR(36) PRIMARY KEY,
    stadium_id CHAR(36),
    image_url TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stadium_id) REFERENCES Stadium(stadium_id)
);