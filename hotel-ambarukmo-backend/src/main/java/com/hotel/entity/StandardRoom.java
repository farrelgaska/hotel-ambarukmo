package com.hotel.entity;

import com.hotel.abstracts.Room;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("STANDARD")
@Getter
@Setter
public class StandardRoom extends Room {

    @Column(name = "has_window")
    private Boolean hasWindow = true;

    @Override
    public Double calculateBasePrice() {
        return 2500000.0;
    }

    @Override
    public String getRoomType() {
        return "Standard Room";
    }
}
