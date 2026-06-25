package com.hotel.abstracts;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * User abstract class demonstrating Abstraction and Inheritance.
 * Contains common properties for Admin, Staff, and Guest.
 * Also demonstrates Encapsulation with private attributes and lombok generated getters/setters.
 */
@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
public abstract class User extends BaseEntity {

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 150)
    private String email;

    @Column(length = 30)
    private String phone;
    
    // Abstract method to demonstrate Polymorphism (Overriding)
    public abstract String getRole();
}
