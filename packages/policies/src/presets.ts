import { defaultConfirmationPolicy } from './confirmation-policy';
import { localLoggingPolicy, remoteSafeLoggingPolicy } from './logging-policy';
import { createOutputPolicy, defaultOutputPolicy } from './output-policy';
import {
  productionOffPolicy,
  productionSafePolicy,
} from './production-policy';
import { defaultRedactionPolicy } from './redaction-policy';
import {
  ciStrictSecurityPolicy,
  localDevSecurityPolicy,
} from './security-policy';
import type { WebMcpPolicySet } from './types';

export const localDevPolicy: WebMcpPolicySet = {
  security: localDevSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: createOutputPolicy({ maxChars: 3000 }),
  production: productionSafePolicy,
  confirmation: defaultConfirmationPolicy,
  logging: localLoggingPolicy,
};

export const ciStrictPolicy: WebMcpPolicySet = {
  security: ciStrictSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: defaultOutputPolicy,
  production: productionOffPolicy,
  confirmation: defaultConfirmationPolicy,
  logging: remoteSafeLoggingPolicy,
};

export const stagingPolicy: WebMcpPolicySet = {
  security: ciStrictSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: createOutputPolicy({ maxChars: 1500, truncate: true }),
  production: productionSafePolicy,
  confirmation: defaultConfirmationPolicy,
  logging: remoteSafeLoggingPolicy,
};

export const debugSessionPolicy: WebMcpPolicySet = {
  security: localDevSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: createOutputPolicy({ maxChars: 800, truncate: true }),
  production: productionSafePolicy,
  confirmation: defaultConfirmationPolicy,
  logging: localLoggingPolicy,
};

export const productionOffPolicySet: WebMcpPolicySet = {
  security: ciStrictSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: defaultOutputPolicy,
  production: productionOffPolicy,
  confirmation: defaultConfirmationPolicy,
  logging: remoteSafeLoggingPolicy,
};

export const productionSafePolicySet: WebMcpPolicySet = {
  security: ciStrictSecurityPolicy,
  redaction: defaultRedactionPolicy,
  output: defaultOutputPolicy,
  production: productionSafePolicy,
  confirmation: defaultConfirmationPolicy,
  logging: remoteSafeLoggingPolicy,
};
