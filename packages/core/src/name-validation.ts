import {
  WebMcpInvalidToolDescriptionError,
  WebMcpInvalidToolNameError,
} from './errors';

const WEBMCP_NAME_PATTERN = /^[A-Za-z0-9_.-]{1,128}$/;

export function validateToolName(name: string): void {
  if (!WEBMCP_NAME_PATTERN.test(name)) {
    throw new WebMcpInvalidToolNameError(name);
  }
}

export function validateToolDescription(
  description: string,
  maxLength = 500,
): string | undefined {
  if (!description.trim()) {
    throw new WebMcpInvalidToolDescriptionError(
      'WebMCP tool description is required.',
    );
  }

  if (description.length > maxLength) {
    return `Tool description exceeds the recommended ${maxLength} characters.`;
  }

  return undefined;
}

export function toBrowserToolName(namespace: string | undefined, name: string) {
  return namespace ? `${namespace}.${name}` : name;
}
