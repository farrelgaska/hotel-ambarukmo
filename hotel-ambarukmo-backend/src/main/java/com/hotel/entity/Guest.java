package com.hotel.entity;

import com.hotel.abstracts.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "guests")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
public class Guest extends User {

    @Column(name = "member_tier", length = 30)
    private String memberTier = "BRONZE";
    
    @Override
    public String getRole() {
        return "GUEST";
    }
}
