import { logger } from "../utils/logger.js";
import { cache } from "../utils/cache.js";
import { ToolManager } from "../tools/toolManager.js";

export class AIModel {
  constructor() {
    this.toolManager = new ToolManager();
    this.userSessions = new Map();
  }

  // Analyze message type and determine response strategy
  analyzeMessage(message, sessionId) {
    const technicalKeywords = [
      "install",
      "setup",
      "configure",
      "debug",
      "code",
      "build",
      "deploy",
      "fix",
      "error",
      "bug",
      "troubleshoot",
    ];
    const contentKeywords = [
      "create",
      "write",
      "generate",
      "note",
      "mcq",
      "summary",
      "explain",
      "list",
      "describe",
    ];

    const lowerMessage = message.toLowerCase();

    const isTechnical = technicalKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );
    const isContent = contentKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    return {
      isTechnical,
      isContent,
      requiresStepByStep: isTechnical && !isContent,
      requiresCompleteOutput: isContent && !isTechnical,
    };
  }

  // Generate step-by-step response for technical tasks
  async generateStepByStepResponse(message, sessionId) {
    const session = this.getUserSession(sessionId);

    if (!session.currentTask) {
      // Start new task
      session.currentTask = {
        type: this.detectTaskType(message),
        steps: await this.generateTaskSteps(message),
        currentStep: 0,
        completedSteps: [],
        context: {},
      };
    }

    const task = session.currentTask;

    if (task.currentStep >= task.steps.length) {
      // Task completed
      const completionMessage = this.generateCompletionMessage(task);
      session.currentTask = null;
      return completionMessage;
    }

    const currentStep = task.steps[task.currentStep];
    task.currentStep++;

    return {
      type: "step",
      stepNumber: task.currentStep,
      totalSteps: task.steps.length,
      content: currentStep.instruction,
      requiresConfirmation: currentStep.requiresConfirmation,
      context: task.context,
    };
  }

  // Generate complete output for content tasks
  async generateCompleteResponse(message, sessionId) {
    const session = this.getUserSession(sessionId);
    const taskType = this.detectContentType(message);

    let content;

    switch (taskType) {
      case "notes":
        content = await this.generateNotes(message);
        break;
      case "mcqs":
        content = await this.generateMCQs(message);
        break;
      case "summary":
        content = await this.generateSummary(message);
        break;
      default:
        content = await this.generateGeneralContent(message);
    }

    return {
      type: "content",
      content: content,
      format: taskType,
    };
  }

  // Detect task type from message
  detectTaskType(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("install") || lowerMessage.includes("setup"))
      return "installation";
    if (lowerMessage.includes("debug") || lowerMessage.includes("fix"))
      return "debugging";
    if (lowerMessage.includes("code") || lowerMessage.includes("program"))
      return "coding";
    if (lowerMessage.includes("configure") || lowerMessage.includes("settings"))
      return "configuration";
    if (lowerMessage.includes("build") || lowerMessage.includes("deploy"))
      return "deployment";

    return "general";
  }

  // Generate task steps based on task type
  async generateTaskSteps(message) {
    const taskType = this.detectTaskType(message);
    const cacheKey = `task_steps_${taskType}_${Buffer.from(message)
      .toString("base64")
      .slice(0, 20)}`;

    const cached = cache.get(cacheKey);
    if (cached) return cached;

    let steps = [];

    switch (taskType) {
      case "installation":
        steps = [
          {
            instruction:
              "Let's check the system requirements first. What operating system are you using?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "I'll help you download the necessary files. Ready to proceed?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "Now let's run the installation command. Make sure you're in the correct directory.",
            requiresConfirmation: true,
          },
          {
            instruction:
              "Let's verify the installation was successful by testing it.",
            requiresConfirmation: true,
          },
        ];
        break;

      case "debugging":
        steps = [
          {
            instruction:
              "Let's first reproduce the error. What specific error message are you seeing?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "I'll help you analyze the error logs. Can you share the relevant code snippet?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "Let's implement a fix for this issue. Ready to try the solution?",
            requiresConfirmation: true,
          },
          {
            instruction: "Now let's test if the fix resolved the issue.",
            requiresConfirmation: true,
          },
        ];
        break;

      case "coding":
        steps = [
          {
            instruction:
              "Let's start by setting up the project structure. What programming language are you using?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "I'll help you write the main functionality. Ready to begin coding?",
            requiresConfirmation: true,
          },
          {
            instruction:
              "Now let's implement the core logic. Share your progress when ready.",
            requiresConfirmation: true,
          },
          {
            instruction:
              "Finally, let's test the code and handle any edge cases.",
            requiresConfirmation: true,
          },
        ];
        break;

      default:
        steps = [
          {
            instruction:
              "Let me break this down into manageable steps. First, let's identify the main requirements...",
            requiresConfirmation: true,
          },
          {
            instruction: "Now, let's tackle the first part. Ready to continue?",
            requiresConfirmation: true,
          },
          {
            instruction: "Great! Moving on to the next phase...",
            requiresConfirmation: true,
          },
          {
            instruction: "Finally, let's review and test everything.",
            requiresConfirmation: true,
          },
        ];
    }

    cache.set(cacheKey, steps, 3600); // Cache for 1 hour
    return steps;
  }

  // Content generation methods
  async generateNotes(message) {
    // In production, integrate with AI APIs
    return {
      title: `Notes: ${message}`,
      content: `# Comprehensive Notes\n\n## Key Points\n- Point 1: Important information\n- Point 2: Detailed explanation\n- Point 3: Practical examples\n\n## Summary\nThis covers the main concepts and practical applications.`,
      format: "markdown",
    };
  }

  async generateMCQs(message) {
    return {
      title: `MCQs: ${message}`,
      questions: [
        {
          question: "Sample question 1?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 0,
          explanation: "Detailed explanation for the correct answer.",
        },
        {
          question: "Sample question 2?",
          options: ["Option A", "Option B", "Option C", "Option D"],
          answer: 1,
          explanation: "Detailed explanation for the correct answer.",
        },
      ],
    };
  }

  async generateSummary(message) {
    return {
      title: `Summary: ${message}`,
      content: `# Executive Summary\n\n## Main Points\n- Key point 1 with details\n- Key point 2 with examples\n- Key point 3 with applications\n\n## Conclusion\nBrief summary of the main takeaways.`,
      format: "markdown",
    };
  }

  async generateGeneralContent(message) {
    return {
      title: `Content: ${message}`,
      content: `Here's the complete content you requested:\n\n${message}\n\nThis includes all the necessary information in a ready-to-use format.`,
      format: "text",
    };
  }

  // Session management
  getUserSession(sessionId) {
    if (!this.userSessions.has(sessionId)) {
      this.userSessions.set(sessionId, {
        preferences: {
          personalizedMode: true,
          stepByStep: true,
          learningMode: true,
        },
        currentTask: null,
        chatHistory: [],
        learningProgress: {},
      });
    }
    return this.userSessions.get(sessionId);
  }

  updateUserPreferences(sessionId, preferences) {
    const session = this.getUserSession(sessionId);
    session.preferences = { ...session.preferences, ...preferences };
    return session.preferences;
  }

  // Tool integration
  async useTool(toolName, input, sessionId) {
    return await this.toolManager.executeTool(toolName, input, sessionId);
  }

  generateCompletionMessage(task) {
    return {
      type: "completion",
      content: `🎉 Task completed successfully!\n\n**Summary:**\n- All ${task.totalSteps} steps executed\n- No errors encountered\n- Ready for your next challenge!\n\nGreat work! 🚀`,
      taskType: task.type,
    };
  }
}

// Initialize AI Models
let aiModelInstance = null;

export function initializeAIModels() {
  if (!aiModelInstance) {
    aiModelInstance = new AIModel();
    logger.info("🤖 AI Models initialized successfully");
  }
  return aiModelInstance;
}

export function getAIModel() {
  if (!aiModelInstance) {
    throw new Error(
      "AI Models not initialized. Call initializeAIModels() first."
    );
  }
  return aiModelInstance;
}
