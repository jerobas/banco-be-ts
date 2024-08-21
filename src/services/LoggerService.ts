import * as fs from "fs";
import * as path from "path";

export class LoggerService {
  private readonly showInConsole: boolean;
  private readonly logFilePath: string;

  constructor(showInConsole: boolean = true) {
    this.showInConsole = showInConsole;
    this.logFilePath = path.join(__dirname, "..", "logs", "application.log");

    const logDir = path.dirname(this.logFilePath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  public async logError(
    controllerName: string,
    methodName: string,
    error: any
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const logMessageConsole = `[${this.colorize(
      timestamp,
      "blue"
    )}] [${this.colorize(
      `Controller: ${controllerName}`,
      "red"
    )}] [${this.colorize(`Method: ${methodName}`, "yellow")}] ${this.colorize(
      error.message,
      "magenta"
    )}\n`;

    const logMessageFile = `[${timestamp}] [Controller: ${controllerName}] [Method: ${methodName}] ${error.message}\n`;

    fs.appendFileSync(this.logFilePath, logMessageFile);

    if (this.showInConsole) {
      console.error(logMessageConsole);
    }
  }

  private colorize(text: string, color: string): string {
    const colors: { [key: string]: string } = {
      blue: "\x1b[34m",
      red: "\x1b[31m",
      yellow: "\x1b[33m",
      magenta: "\x1b[35m",
      reset: "\x1b[0m",
    };
    return `${colors[color]}${text}${colors.reset}`;
  }
}
