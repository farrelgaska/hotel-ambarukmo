package com.hotel.mapper;

import com.hotel.abstracts.Room;
import com.hotel.dto.RoomDTO;

public class RoomMapper {
    public static RoomDTO toDTO(Room room) {
        if (room == null) return null;
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setStatus(room.getStatus());
        dto.setFloor(room.getFloor());
        dto.setBasePrice(room.getEffectivePrice());
        dto.setRoomType(room.getRoomType());
        return dto;
    }
}
