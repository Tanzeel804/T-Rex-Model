import express from "express";
import { getAIModel } from "../ai/aiModels.js";
import { logger } from "../utils/logger.js";

export function setupRoutes(app) {
  const router = express.Router();

  // Health check endpoint
  router.get("/health", (req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  });

  // Get available tools
  router.get("/tools", (req, res) => {
    try {
      const aiModel = getAIModel();
      const tools = aiModel.toolManager.getAvailableTools();

      res.json({
        success: true,
        tools,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Tools endpoint error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch tools",
      });
    }
  });

  // Execute tool via REST API
  router.post("/tools/:toolName", async (req, res) => {
    try {
      const { toolName } = req.params;
      const { input, sessionId = "rest-api" } = req.body;

      if (!input) {
        return res.status(400).json({
          success: false,
          error: "Input is required",
        });
      }

      const aiModel = getAIModel();
      const result = await aiModel.useTool(toolName, input, sessionId);

      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`Tool execution error for ${req.params.toolName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // Get AI capabilities
  router.get("/capabilities", (req, res) => {
    res.json({
      capabilities: {
        personalizedGuidance: true,
        stepByStep: true,
        contentCreation: true,
        tools: [
          "calculator",
          "translator",
          "dictionary",
          "weather",
          "image",
          "code",
        ],
        features: [
          "real-time chat",
          "session management",
          "preferences",
          "error handling",
        ],
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Apply routes
  app.use("/api", router);

  logger.info("🛣️ API routes setup completed");
}
