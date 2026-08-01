package dev.agenticpreflight.demo;

import java.math.BigDecimal;
import java.math.RoundingMode;

import org.springframework.stereotype.Service;

@Service
public class PriceCalculator {

    public BigDecimal applyDiscount(BigDecimal price, int percentage) {
        if (price == null || price.signum() < 0) {
            throw new IllegalArgumentException("price must be non-negative");
        }
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("percentage must be between 0 and 100");
        }

        BigDecimal multiplier = BigDecimal.valueOf(100L - percentage)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return price.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
