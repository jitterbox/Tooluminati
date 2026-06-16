export class WebMcpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class WebMcpUnsupportedError extends WebMcpError {
  constructor() {
    super('WebMCP is not available in this browser context.');
  }
}

export class WebMcpInvalidToolNameError extends WebMcpError {
  constructor(name: string) {
    super(`Invalid WebMCP tool name "${name}".`);
  }
}

export class WebMcpInvalidToolDescriptionError extends WebMcpError {
  constructor(message: string) {
    super(message);
  }
}

export class WebMcpNameCollisionError extends WebMcpError {
  constructor(name: string) {
    super(`A WebMCP tool named "${name}" is already registered.`);
  }
}

export class WebMcpRegistrationError extends WebMcpError {
  constructor(name: string, cause: unknown) {
    super(`Failed to register WebMCP tool "${name}": ${String(cause)}`);
  }
}

export class WebMcpExecutionValidationError extends WebMcpError {
  constructor(name: string, cause: unknown) {
    super(`Invalid arguments for WebMCP tool "${name}": ${String(cause)}`);
  }
}

export class WebMcpSecurityPolicyError extends WebMcpError {
  constructor(message: string) {
    super(message);
  }
}

export class WebMcpConfirmationRequiredError extends WebMcpError {
  constructor(name: string) {
    super(`Tool "${name}" requires confirmation before execution.`);
  }
}
