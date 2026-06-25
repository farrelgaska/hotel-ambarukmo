package com.hotel.service.interfaces;

import java.util.Map;

public interface SettingsService {
    Map<String, String> getHotelProfile();
    Map<String, String> updateHotelProfile(Map<String, String> profile);
    Map<String, Object> getPreferences();
    Map<String, Object> updatePreferences(Map<String, Object> preferences);
}
