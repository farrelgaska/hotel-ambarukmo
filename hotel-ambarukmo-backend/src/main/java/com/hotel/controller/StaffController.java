package com.hotel.controller;

import com.hotel.dto.StaffDTO;
import com.hotel.dto.StaffRequestDTO;
import com.hotel.service.interfaces.StaffService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;

@RestController
@RequestMapping("/api/staff")
public class StaffController extends BaseController {

    private final StaffService staffService;

    public StaffController(StaffService staffService) {
        this.staffService = staffService;
    }

    @GetMapping
    public ResponseEntity<BaseResponse<List<StaffDTO>>> getAllStaff() {
        return successResponse(staffService.getAllStaff());
    }

    @PostMapping
    public ResponseEntity<BaseResponse<StaffDTO>> createStaff(@RequestBody StaffRequestDTO request) {
        return successResponse(staffService.createStaff(request), "Staff created successfully", HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<StaffDTO>> updateStaff(@PathVariable Long id, @RequestBody StaffRequestDTO request) {
        return successResponse(staffService.updateStaff(id, request), "Staff updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return successResponse(null, "Staff deleted successfully");
    }
}
