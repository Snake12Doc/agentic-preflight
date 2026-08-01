package dev.agenticpreflight.demo;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

class PriceCalculatorTest {

    private final PriceCalculator calculator = new PriceCalculator();

    @Test
    void appliesPercentageDiscount() {
        BigDecimal result = calculator.applyDiscount(new BigDecimal("125.00"), 20);

        assertThat(result).isEqualByComparingTo("100.00");
    }

    @Test
    void rejectsPercentageAboveOneHundred() {
        assertThatThrownBy(() -> calculator.applyDiscount(BigDecimal.TEN, 101))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("percentage must be between 0 and 100");
    }
}
