-- Reference schema for Hotel Ambarukmo (MySQL)
-- Tables are auto-created by Hibernate (ddl-auto=update).
-- Use this script for manual setup or documentation.

CREATE DATABASE IF NOT EXISTS hotel_ambarukmo
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotel_ambarukmo;

-- JOINED inheritance: User hierarchy
CREATE TABLE IF NOT EXISTS users (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(100) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(150),
    phone           VARCHAR(30),
    created_at      DATETIME(6) NOT NULL,
    updated_at      DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS admins (
    id              BIGINT PRIMARY KEY,
    access_level    VARCHAR(30),
    CONSTRAINT fk_admins_user FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS guests (
    id              BIGINT PRIMARY KEY,
    member_tier     VARCHAR(30),
    CONSTRAINT fk_guests_user FOREIGN KEY (id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS staffs (
    id              BIGINT PRIMARY KEY,
    department      VARCHAR(100),
    position        VARCHAR(100),
    staff_status    VARCHAR(30),
    CONSTRAINT fk_staffs_user FOREIGN KEY (id) REFERENCES users(id)
);

-- SINGLE_TABLE inheritance: Room hierarchy
CREATE TABLE IF NOT EXISTS rooms (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_category       VARCHAR(31) NOT NULL,
    room_number         VARCHAR(20) NOT NULL UNIQUE,
    status              VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    floor               INT NOT NULL,
    base_price_override DOUBLE,
    has_window          BIT(1),
    has_living_room     BIT(1),
    has_bathtub         BIT(1),
    created_at          DATETIME(6) NOT NULL,
    updated_at          DATETIME(6) NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_code    VARCHAR(50) NOT NULL UNIQUE,
    room_id         BIGINT NOT NULL,
    guest_id        BIGINT,
    guest_name      VARCHAR(150),
    check_in        DATE NOT NULL,
    check_out       DATE NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    total_price     DOUBLE,
    created_at      DATETIME(6) NOT NULL,
    updated_at      DATETIME(6) NOT NULL,
    CONSTRAINT fk_reservation_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_reservation_guest FOREIGN KEY (guest_id) REFERENCES guests(id)
);
