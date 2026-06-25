package com.hotel.util;

import com.hotel.entity.Reservation;

/**
 * Strategy Pattern Interface for Pricing/Discounts
 * Demonstrates Open-Closed Principle.
 */
public interface PricingStrategy {
    Double calculatePrice(Reservation reservation, int nights);
}
