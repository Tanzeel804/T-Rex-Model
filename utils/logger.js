export class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || "info";
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  log(level, message, meta = {}) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    // Console output
    console.log(JSON.stringify(logEntry));

    // In production, you would send to a logging service
  }

  info(message, meta = {}) {
    this.log("info", message, meta);
  }

  error(message, meta = {}) {
    this.log("error", message, meta);
  }

  warn(message, meta = {}) {
    this.log("warn", message, meta);
  }

  debug(message, meta = {}) {
    if (this.logLevel === "debug") {
      this.log("debug", message, meta);
    }
  }
}

export const logger = new Logger();

// Error handling middleware
export function errorHandler(err, req, res, next) {
  logger.error("Unhandled error:", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}
