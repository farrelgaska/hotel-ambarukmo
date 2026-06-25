package com.hotel.entity;

import com.hotel.abstracts.Room;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("SUITE")
@Getter
@Setter
public class SuiteRoom extends Room {

    @Column(name = "has_living_room")
    private Boolean hasLivingRoom = true;

    @Column(name = "has_bathtub")
    private Boolean hasBathtub = true;

    @Override
    public Double calculateBasePrice() {
        // Polymorphism: Suite room costs more
        return 5800000.0; 
    }

    @Override
    public String getRoomType() {
        return "Executive Suite";
    }
}
