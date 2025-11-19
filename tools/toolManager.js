import { Calculator } from './calculator.js';
import { Translator } from './translator.js';
import { Dictionary } from './dictionary.js';
import { Weather } from './weather.js';

export class ToolManager {
  constructor() {
    this.tools = new Map();
    this.initializeTools();
  }

  initializeTools() {
    this.tools.set('calculator', new Calculator());
    this.tools.set('translator', new Translator());
    this.tools.set('dictionary', new Dictionary());
    this.tools.set('weather', new Weather());
  }

  async executeTool(toolName, input, sessionId) {
    const tool = this.tools.get(toolName.toLowerCase());
    
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found`);
    }

    try {
      const result = await tool.execute(input, sessionId);
      return result;
    } catch (error) {
      throw new Error(`Tool execution failed: ${error.message}`);
    }
  }

  getAvailableTools() {
    return Array.from(this.tools.keys()).map(toolName => ({
      name: toolName,
      description: this.tools.get(toolName).description
    }));
  }
}

