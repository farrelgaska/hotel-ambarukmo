package com.hotel.service.impl;

import com.hotel.service.interfaces.SettingsService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SettingsServiceImpl implements SettingsService {

    private final Map<String, String> hotelProfile = new ConcurrentHashMap<>(Map.of(
            "name", "Hotel Ambarukmo",
            "location", "Yogyakarta, Indonesia",
            "phone", "+62 274 123 4567",
            "email", "info@hotelambarukmo.com",
            "website", "https://hotelambarukmo.com"
    ));

    private final Map<String, Object> preferences = new ConcurrentHashMap<>(Map.of(
            "language", "id",
            "timezone", "Asia/Jakarta",
            "currency", "IDR",
            "notifications", true
    ));

    @Override
    public Map<String, String> getHotelProfile() {
        return new HashMap<>(hotelProfile);
    }

    @Override
    public Map<String, String> updateHotelProfile(Map<String, String> profile) {
        hotelProfile.putAll(profile);
        return getHotelProfile();
    }

    @Override
    public Map<String, Object> getPreferences() {
        return new HashMap<>(preferences);
    }

    @Override
    public Map<String, Object> updatePreferences(Map<String, Object> updated) {
        preferences.putAll(updated);
        return getPreferences();
    }
}
