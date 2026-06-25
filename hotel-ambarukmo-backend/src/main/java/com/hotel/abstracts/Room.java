package com.hotel.abstracts;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Room abstract class demonstrating Abstraction and Inheritance.
 * Using SINGLE_TABLE strategy to store all room types in one table with a discriminator column.
 */
@Entity
@Table(name = "rooms")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "room_category", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
public abstract class Room extends BaseEntity {

    @Column(name = "room_number", nullable = false, unique = true, length = 20)
    private String roomNumber;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, BOOKED, OCCUPIED, MAINTENANCE

    @Column(nullable = false)
    private Integer floor;

    @Column(name = "base_price_override")
    private Double basePriceOverride;
    
    // Abstract method to be overridden by child classes (Polymorphism)
    public abstract Double calculateBasePrice();

    public Double getEffectivePrice() {
        return basePriceOverride != null ? basePriceOverride : calculateBasePrice();
    }
    
    public abstract String getRoomType();
}
