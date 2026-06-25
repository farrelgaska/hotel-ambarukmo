package com.hotel.entity;

import com.hotel.abstracts.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "staffs")
@PrimaryKeyJoinColumn(name = "id")
@Getter
@Setter
public class Staff extends User {

    @Column(length = 100)
    private String department;

    @Column(length = 100)
    private String position;

    @Column(name = "staff_status", length = 30)
    private String status = "Active";
    
    @Override
    public String getRole() {
        return "STAFF";
    }
}
