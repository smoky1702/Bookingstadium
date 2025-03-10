package com.example.bookingStadium.exception;

public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception"),
    KEY_INVALID(1001, "Invalid message key"),
    EMAIL_EXISTED(1002, "Email existed"),
    EMAIL_INVALID(1003,  "Invalid email address"),
    PASSWORD_INVALID(1004, "Password must be at least 6 characters"),
    USER_NOT_EXISTED(1005, "User not existed"),
    TYPE_OF_STADIUM_EXISTED(1006, "Type of stadium existed"),
    TYPE_OF_STADIUM_NOT_EXISTED(1007, "Type of stadium not existed"),
    STADIUM_LOCATION_EXISTED(1008, "Stadium location existed"),
    STADIUM_LOCATION_NOT_EXISTED(1009, "Stadium location not existed"),
    EMAIL_NOT_EXISTED(1010, "User not existed"),
    ROLE_NOT_EXISTED(1011, "Role not existed"),
    UNAUTHENTICATED(1012, "Unauthenticated"),
            ;
    private int code;
    private String message;

    public int getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
