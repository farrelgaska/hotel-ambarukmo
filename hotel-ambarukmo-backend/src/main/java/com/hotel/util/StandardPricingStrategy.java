package com.hotel.util;

import com.hotel.entity.Guest;
import com.hotel.entity.Reservation;
import org.springframework.stereotype.Component;

@Component("standardPricingStrategy")
public class StandardPricingStrategy implements PricingStrategy {

    @Override
    public Double calculatePrice(Reservation reservation, int nights) {
        if (reservation.getRoom() == null) return 0.0;
        double nightlyRate = reservation.getRoom().getEffectivePrice();
        Guest guest = reservation.getGuest();
        if (guest != null && guest.getMemberTier() != null) {
            String tier = guest.getMemberTier().toUpperCase();
            if ("GOLD".equals(tier)) {
                nightlyRate *= 0.9;
            } else if ("PLATINUM".equals(tier) || "VIP".equals(tier)) {
                nightlyRate *= 0.85;
            }
        }
        return nightlyRate * nights;
    }
}
