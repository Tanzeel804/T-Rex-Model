import axios from "axios";
import { logger } from "../utils/logger.js";

export class Dictionary {
  constructor() {
    this.name = "dictionary";
    this.description = "English dictionary with definitions and examples";
  }

  async execute(input, sessionId) {
    try {
      const word = input.trim().toLowerCase();

      // Using Free Dictionary API
      const response = await axios.get(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      );

      const data = response.data[0];

      return {
        success: true,
        word: word,
        phonetic: data.phonetic || "",
        meanings: data.meanings.map((meaning) => ({
          partOfSpeech: meaning.partOfSpeech,
          definitions: meaning.definitions.slice(0, 3).map((def) => ({
            definition: def.definition,
            example: def.example || "",
          })),
        })),
        source: data.sourceUrls?.[0] || "",
        type: "dictionary",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Dictionary lookup error:", error);

      // Fallback to mock data
      return await this.mockDictionaryLookup(input);
    }
  }

  async mockDictionaryLookup(word) {
    const mockData = {
      hello: {
        phonetic: "/həˈləʊ/",
        meanings: [
          {
            partOfSpeech: "interjection",
            definitions: [
              {
                definition: "Used as a greeting or to begin a conversation",
                example: "Hello, how are you today?",
              },
            ],
          },
        ],
      },
      computer: {
        phonetic: "/kəmˈpjuːtə/",
        meanings: [
          {
            partOfSpeech: "noun",
            definitions: [
              {
                definition:
                  "An electronic device for storing and processing data",
                example: "I work on my computer all day.",
              },
            ],
          },
        ],
      },
    };

    const data = mockData[word.toLowerCase()];

    if (!data) {
      return {
        success: false,
        word: word,
        error: "Word not found in dictionary",
      };
    }

    return {
      success: true,
      word: word,
      ...data,
      type: "dictionary",
      timestamp: new Date().toISOString(),
    };
  }

  validateInput(input) {
    const word = input.trim();
    return word.length > 1 && word.length < 50 && /^[a-zA-Z]+$/.test(word);
  }
}
