package com.hotel.mapper;

import com.hotel.abstracts.User;
import com.hotel.dto.UserDTO;
import com.hotel.entity.Guest;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        
        if (user instanceof Guest) {
            dto.setMemberTier(((Guest) user).getMemberTier());
        }
        return dto;
    }
}
