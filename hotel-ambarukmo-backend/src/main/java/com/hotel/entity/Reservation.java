package com.hotel.entity;

import com.hotel.abstracts.BaseEntity;
import com.hotel.abstracts.Room;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

/**
 * Reservation entity demonstrating Object Composition.
 * A Reservation "has a" Room and "has a" Guest.
 */
@Entity
@Table(name = "reservations")
@Getter
@Setter
public class Reservation extends BaseEntity {

    @Column(name = "booking_code", nullable = false, unique = true, length = 50)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false, foreignKey = @ForeignKey(name = "fk_reservation_room"))
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guest_id", foreignKey = @ForeignKey(name = "fk_reservation_guest"))
    private Guest guest;

    @Column(name = "guest_name", length = 150)
    private String guestName;

    @Column(name = "check_in", nullable = false)
    private LocalDate checkIn;

    @Column(name = "check_out", nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false, length = 30)
    private String status = "CONFIRMED";

    @Column(name = "total_price")
    private Double totalPrice;
}
