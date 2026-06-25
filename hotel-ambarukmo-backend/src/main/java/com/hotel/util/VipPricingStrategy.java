package com.hotel.util;

import com.hotel.entity.Reservation;
import org.springframework.stereotype.Component;

/**
 * VIP Pricing Strategy - 10% Discount
 */
@Component
public class VipPricingStrategy implements PricingStrategy {
    
    @Override
    public Double calculatePrice(Reservation reservation, int nights) {
        if (reservation.getRoom() == null) return 0.0;
        Double basePrice = reservation.getRoom().calculateBasePrice() * nights;
        return basePrice * 0.90; // 10% discount
    }
}
