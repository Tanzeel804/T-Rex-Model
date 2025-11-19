import { evaluate } from "mathjs";
import { logger } from "../utils/logger.js";

export class Calculator {
  constructor() {
    this.name = "calculator";
    this.description =
      "Advanced calculator for mathematical operations and unit conversions";
  }

  async execute(input, sessionId) {
    try {
      // Handle unit conversions
      if (input.includes(" to ")) {
        return await this.handleUnitConversion(input);
      }

      // Handle mathematical expressions
      const result = evaluate(input);

      return {
        success: true,
        input: input,
        result: result,
        type: "calculation",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Calculator error:", error);
      return {
        success: false,
        input: input,
        error: "Invalid mathematical expression",
        suggestion: "Please check your input format",
      };
    }
  }

  async handleUnitConversion(input) {
    const [valuePart, conversion] = input.split(" to ");
    const value = parseFloat(valuePart);

    if (isNaN(value)) {
      throw new Error("Invalid value for conversion");
    }

    const conversions = {
      "km to miles": value * 0.621371,
      "miles to km": value / 0.621371,
      "celsius to fahrenheit": (value * 9) / 5 + 32,
      "fahrenheit to celsius": ((value - 32) * 5) / 9,
      "kg to pounds": value * 2.20462,
      "pounds to kg": value / 2.20462,
    };

    const result = conversions[conversion.trim().toLowerCase()];

    if (result === undefined) {
      throw new Error(`Unsupported conversion: ${conversion}`);
    }

    return {
      success: true,
      input: input,
      result: parseFloat(result.toFixed(4)),
      type: "unit_conversion",
      timestamp: new Date().toISOString(),
    };
  }

  validateInput(input) {
    // Basic validation for mathematical expressions
    const safePattern = /^[0-9+\-*/().\s^to°]+$/;
    return safePattern.test(input);
  }
}
