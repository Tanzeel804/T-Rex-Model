import { getAIModel } from "../ai/aiModels.js";
import { logger } from "../utils/logger.js";

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    logger.info(`🔌 User connected: ${socket.id}`);

    // User joins their personal room
    socket.join(socket.id);

    // Handle chat messages
    socket.on("send_message", async (data) => {
      try {
        const aiModel = getAIModel();
        const { message, sessionId } = data;

        logger.info(
          `💬 Message received from ${socket.id}: ${message.substring(
            0,
            50
          )}...`
        );

        // Analyze message and get AI response
        const analysis = aiModel.analyzeMessage(message, sessionId);
        let response;

        if (analysis.requiresStepByStep) {
          response = await aiModel.generateStepByStepResponse(
            message,
            sessionId
          );
        } else if (analysis.requiresCompleteOutput) {
          response = await aiModel.generateCompleteResponse(message, sessionId);
        } else {
          response = await aiModel.generateCompleteResponse(message, sessionId);
        }

        // Send response back to user
        socket.emit("ai_response", {
          ...response,
          sessionId,
          timestamp: new Date().toISOString(),
        });

        logger.info(`🤖 AI response sent to ${socket.id}`);
      } catch (error) {
        logger.error("Message handling error:", error);
        socket.emit("error", {
          type: "message_processing",
          message: "Failed to process message",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle tool execution
    socket.on("execute_tool", async (data) => {
      try {
        const aiModel = getAIModel();
        const { toolName, input, sessionId } = data;

        logger.info(`🛠️ Tool execution requested: ${toolName} by ${socket.id}`);

        const result = await aiModel.useTool(toolName, input, sessionId);

        socket.emit("tool_result", {
          ...result,
          toolName,
          sessionId,
          timestamp: new Date().toISOString(),
        });

        logger.info(`✅ Tool ${toolName} executed successfully`);
      } catch (error) {
        logger.error("Tool execution error:", error);
        socket.emit("error", {
          type: "tool_execution",
          message: `Tool execution failed: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle user preferences update
    socket.on("update_preferences", async (data) => {
      try {
        const aiModel = getAIModel();
        const { preferences, sessionId } = data;

        const updated = aiModel.updateUserPreferences(sessionId, preferences);

        socket.emit("preferences_updated", {
          preferences: updated,
          sessionId,
          timestamp: new Date().toISOString(),
        });

        logger.info(`⚙️ Preferences updated for ${socket.id}`);
      } catch (error) {
        logger.error("Preferences update error:", error);
        socket.emit("error", {
          type: "preferences_update",
          message: "Failed to update preferences",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle step confirmation
    socket.on("confirm_step", async (data) => {
      try {
        const aiModel = getAIModel();
        const { sessionId, stepResult } = data;

        const session = aiModel.getUserSession(sessionId);

        if (session.currentTask) {
          // Process step confirmation and get next step
          const response = await aiModel.generateStepByStepResponse(
            "continue",
            sessionId
          );

          socket.emit("ai_response", {
            ...response,
            sessionId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        logger.error("Step confirmation error:", error);
        socket.emit("error", {
          type: "step_confirmation",
          message: "Failed to process step confirmation",
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      logger.info(`🔌 User disconnected: ${socket.id} - ${reason}`);
    });

    // Handle errors
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info("🔌 Socket handlers setup completed");
}
