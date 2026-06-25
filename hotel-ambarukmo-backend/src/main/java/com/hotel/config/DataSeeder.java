package com.hotel.config;

import com.hotel.entity.Admin;
import com.hotel.entity.Guest;
import com.hotel.entity.Staff;
import com.hotel.entity.StandardRoom;
import com.hotel.entity.SuiteRoom;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedDatabase(
            UserRepository userRepository,
            RoomRepository roomRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }

            Admin admin = new Admin();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setName("Administrator");
            admin.setEmail("admin@hotelambarukmo.com");
            admin.setPhone("081234567890");
            userRepository.save(admin);

            Staff staff = new Staff();
            staff.setUsername("staff");
            staff.setPassword(passwordEncoder.encode("staff123"));
            staff.setName("Staff Front Office");
            staff.setEmail("staff@hotelambarukmo.com");
            staff.setPhone("081234567891");
            staff.setDepartment("Front Office");
            staff.setStatus("Active");
            userRepository.save(staff);

            Guest guest = new Guest();
            guest.setUsername("guest");
            guest.setPassword(passwordEncoder.encode("guest123"));
            guest.setName("Budi Santoso");
            guest.setEmail("guest@hotelambarukmo.com");
            guest.setPhone("081234567892");
            guest.setMemberTier("GOLD");
            userRepository.save(guest);

            createStandardRoom(roomRepository, "101", 1, 2500000.0);
            createStandardRoom(roomRepository, "102", 1, 2500000.0);
            createStandardRoom(roomRepository, "201", 2, 2800000.0);
            createSuiteRoom(roomRepository, "301", 3, 5800000.0);
            createSuiteRoom(roomRepository, "401", 4, 15000000.0);

            log.info("Database seeded: admin/staff/guest accounts and {} rooms", roomRepository.count());
        };
    }

    private void createStandardRoom(RoomRepository roomRepository, String number, int floor, double price) {
        StandardRoom room = new StandardRoom();
        room.setRoomNumber(number);
        room.setFloor(floor);
        room.setStatus("AVAILABLE");
        room.setBasePriceOverride(price);
        roomRepository.save(room);
    }

    private void createSuiteRoom(RoomRepository roomRepository, String number, int floor, double price) {
        SuiteRoom room = new SuiteRoom();
        room.setRoomNumber(number);
        room.setFloor(floor);
        room.setStatus("AVAILABLE");
        room.setBasePriceOverride(price);
        roomRepository.save(room);
    }
}
