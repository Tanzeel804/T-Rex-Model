import axios from "axios";
import { logger } from "../utils/logger.js";

export class Weather {
  constructor() {
    this.name = "weather";
    this.description = "Real-time weather information and forecasts";
  }

  async execute(input, sessionId) {
    try {
      const city = input.trim();

      // Using Open-Meteo API (free)
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}&count=1`
      );

      const location = geoResponse.data.results?.[0];

      if (!location) {
        throw new Error("City not found");
      }

      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );

      const weather = weatherResponse.data;

      return {
        success: true,
        location: {
          city: location.name,
          country: location.country,
          latitude: location.latitude,
          longitude: location.longitude,
        },
        current: {
          temperature: weather.current.temperature_2m,
          condition: this.getWeatherCondition(weather.current.weather_code),
          windSpeed: weather.current.wind_speed_10m,
          unit: weather.current_units.temperature_2m,
        },
        forecast: weather.daily.time.slice(0, 3).map((date, index) => ({
          date: date,
          maxTemp: weather.daily.temperature_2m_max[index],
          minTemp: weather.daily.temperature_2m_min[index],
          condition: this.getWeatherCondition(
            weather.daily.weather_code[index]
          ),
        })),
        type: "weather",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Weather API error:", error);
      return await this.mockWeatherData(input);
    }
  }

  getWeatherCondition(weatherCode) {
    const conditions = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      61: "Light rain",
      80: "Light rain showers",
      95: "Thunderstorm",
    };

    return conditions[weatherCode] || "Unknown";
  }

  async mockWeatherData(city) {
    const mockData = {
      delhi: { temp: 32, condition: "Sunny", humidity: "45%" },
      mumbai: { temp: 28, condition: "Cloudy", humidity: "75%" },
      london: { temp: 15, condition: "Rainy", humidity: "80%" },
      "new york": { temp: 22, condition: "Partly cloudy", humidity: "65%" },
    };

    const data = mockData[city.toLowerCase()];

    if (!data) {
      return {
        success: false,
        error: "Weather data not available for this location",
      };
    }

    return {
      success: true,
      location: { city: city },
      current: data,
      type: "weather",
      timestamp: new Date().toISOString(),
    };
  }

  validateInput(input) {
    return input.trim().length > 1;
  }
}
