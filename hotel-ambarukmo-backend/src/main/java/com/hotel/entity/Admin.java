package com.hotel.entity;

import com.hotel.abstracts.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admins")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
public class Admin extends User {

    @Column(name = "access_level", length = 30)
    private String accessLevel = "SUPER_ADMIN";
    
    @Override
    public String getRole() {
        return "ADMIN";
    }
}
