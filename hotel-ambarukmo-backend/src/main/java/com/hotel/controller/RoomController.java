package com.hotel.controller;

import com.hotel.dto.RoomDTO;
import com.hotel.dto.RoomRequestDTO;
import com.hotel.service.interfaces.RoomService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;

@RestController
@RequestMapping("/api/rooms")
public class RoomController extends BaseController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<BaseResponse<List<RoomDTO>>> getAllRooms() {
        return successResponse(roomService.getAllRooms());
    }

    @GetMapping("/available")
    public ResponseEntity<BaseResponse<List<RoomDTO>>> getAvailableRooms() {
        return successResponse(roomService.getAvailableRooms());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<RoomDTO>> getRoomById(@PathVariable Long id) {
        return successResponse(roomService.getRoomById(id));
    }

    @PostMapping
    public ResponseEntity<BaseResponse<RoomDTO>> createRoom(@RequestBody RoomRequestDTO request) {
        return successResponse(roomService.createRoomFromRequest(request), "Room created successfully", HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<RoomDTO>> updateRoom(@PathVariable Long id, @RequestBody RoomRequestDTO request) {
        return successResponse(roomService.updateRoom(id, request), "Room updated successfully");
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BaseResponse<RoomDTO>> updateRoomStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return successResponse(roomService.updateRoomStatus(id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return successResponse(null, "Room deleted successfully");
    }
}
