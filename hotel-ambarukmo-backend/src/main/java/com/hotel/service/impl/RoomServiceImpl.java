package com.hotel.service.impl;

import com.hotel.abstracts.Room;
import com.hotel.dto.RoomDTO;
import com.hotel.dto.RoomRequestDTO;
import com.hotel.entity.StandardRoom;
import com.hotel.entity.SuiteRoom;
import com.hotel.mapper.RoomMapper;
import com.hotel.repository.RoomRepository;
import com.hotel.service.interfaces.RoomService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.hotel.abstracts.service.BaseService;

@Service
public class RoomServiceImpl extends BaseService<Room, Long> implements RoomService {

    private final RoomRepository roomRepository;

    public RoomServiceImpl(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Override
    protected org.springframework.data.jpa.repository.JpaRepository<Room, Long> getRepository() {
        return roomRepository;
    }

    @Override
    protected String getEntityName() {
        return "Room";
    }

    @Override
    public List<RoomDTO> getAllRooms() {
        return findAll().stream()
                .map(RoomMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomDTO> getAvailableRooms() {
        return roomRepository.findByStatus("AVAILABLE").stream()
                .map(RoomMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public RoomDTO getRoomById(Long id) {
        return RoomMapper.toDTO(findByIdOrThrow(id));
    }

    @Override
    public RoomDTO createRoomFromRequest(RoomRequestDTO request) {
        Room room = buildRoomEntity(request);
        return RoomMapper.toDTO(save(room));
    }

    @Override
    public RoomDTO updateRoom(Long id, RoomRequestDTO request) {
        Room room = findByIdOrThrow(id);
        applyRoomRequest(room, request);
        return RoomMapper.toDTO(save(room));
    }

    @Override
    public RoomDTO updateRoomStatus(Long id, String status) {
        if (status == null || status.isBlank()) {
            throw new com.hotel.exception.BadRequestException("Room status is required");
        }
        Room room = findByIdOrThrow(id);
        room.setStatus(status.toUpperCase());
        return RoomMapper.toDTO(save(room));
    }

    @Override
    public void deleteRoom(Long id) {
        deleteById(id);
    }

    private Room buildRoomEntity(RoomRequestDTO request) {
        Room room = createRoomByType(request.getType());
        applyRoomRequest(room, request);
        if (room.getRoomNumber() == null || room.getRoomNumber().isBlank()) {
            throw new com.hotel.exception.BadRequestException("Room number is required");
        }
        return room;
    }

    private void applyRoomRequest(Room room, RoomRequestDTO request) {
        if (request.getNumber() != null && !request.getNumber().isBlank()) {
            room.setRoomNumber(request.getNumber());
        }
        if (request.getStatus() != null) {
            room.setStatus(request.getStatus());
        }
        if (request.getFloor() != null) {
            room.setFloor(request.getFloor());
        } else if (request.getNumber() != null && !request.getNumber().isBlank()) {
            room.setFloor(parseFloor(request.getNumber()));
        }
        if (request.getPrice() != null) {
            room.setBasePriceOverride(request.getPrice());
        }
    }

    private Room createRoomByType(String type) {
        String normalized = type != null ? type.toLowerCase() : "";
        if (normalized.contains("suite") || normalized.contains("presidential") || normalized.contains("executive")) {
            return new SuiteRoom();
        }
        return new StandardRoom();
    }

    private int parseFloor(String roomNumber) {
        try {
            return Integer.parseInt(roomNumber.replaceAll("\\D", "").substring(0, 1));
        } catch (Exception e) {
            return 1;
        }
    }
}
