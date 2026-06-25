package com.hotel.service.interfaces;

import com.hotel.dto.RoomDTO;
import com.hotel.dto.RoomRequestDTO;
import java.util.List;

public interface RoomService {
    List<RoomDTO> getAllRooms();
    List<RoomDTO> getAvailableRooms();
    RoomDTO getRoomById(Long id);
    RoomDTO createRoomFromRequest(RoomRequestDTO request);
    RoomDTO updateRoom(Long id, RoomRequestDTO request);
    RoomDTO updateRoomStatus(Long id, String status);
    void deleteRoom(Long id);
}
