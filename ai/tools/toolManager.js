import { Calculator } from "./calculator.js";
import { Translator } from "./translator.js";
import { Dictionary } from "./dictionary.js";
import { Weather } from "./weather.js";
import { ImageGenerator } from "./imageGenerator.js";
import { CodeHelper } from "./codeHelper.js";
import { logger } from "../utils/logger.js";
import { cache } from "../utils/cache.js";

export class ToolManager {
  constructor() {
    this.tools = new Map();
    this.initializeTools();
  }

  initializeTools() {
    this.tools.set("calculator", new Calculator());
    this.tools.set("translator", new Translator());
    this.tools.set("dictionary", new Dictionary());
    this.tools.set("weather", new Weather());
    this.tools.set("image", new ImageGenerator());
    this.tools.set("code", new CodeHelper());

    logger.info("🛠️ All tools initialized");
  }

  async executeTool(toolName, input, sessionId) {
    const tool = this.tools.get(toolName.toLowerCase());

    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    // Create cache key
    const cacheKey = `tool_${toolName}_${Buffer.from(
      JSON.stringify(input)
    ).toString("base64")}`;

    // Check cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      logger.debug(`Cache hit for tool: ${toolName}`);
      return cachedResult;
    }

    try {
      logger.info(`Executing tool: ${toolName} for session: ${sessionId}`);

      const result = await tool.execute(input, sessionId);

      // Cache successful results
      cache.set(cacheKey, result, 300); // Cache for 5 minutes

      return result;
    } catch (error) {
      logger.error(`Tool execution failed: ${toolName}`, error);
      throw new Error(`Tool '${toolName}' execution failed: ${error.message}`);
    }
  }

  getAvailableTools() {
    return Array.from(this.tools.keys()).map((toolName) => ({
      name: toolName,
      description: this.tools.get(toolName).description,
      enabled: true,
    }));
  }

  validateToolInput(toolName, input) {
    const tool = this.tools.get(toolName);
    if (!tool) return false;

    return tool.validateInput ? tool.validateInput(input) : true;
  }
}
