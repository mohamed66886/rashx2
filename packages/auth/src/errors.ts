/**
 * @rashx/auth - Typed Error Hierarchy
 *
 * Provides distinct, strongly-typed error classes for authentication failures,
 * token verification issues, and environment configuration errors.
 */

export class AuthError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigurationError extends AuthError {
  constructor(message: string) {
    super(message, 'AUTH_CONFIGURATION_ERROR');
  }
}

export class InvalidTokenError extends AuthError {
  constructor(message: string = 'The provided authentication token is invalid or malformed.') {
    super(message, 'INVALID_TOKEN');
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message: string = 'The authentication token has expired.') {
    super(message, 'TOKEN_EXPIRED');
  }
}

export class TokenRevokedError extends AuthError {
  constructor(message: string = 'The authentication token or session has been revoked.') {
    super(message, 'TOKEN_REVOKED');
  }
}

export class UnauthenticatedError extends AuthError {
  constructor(message: string = 'Authentication is required to perform this operation.') {
    super(message, 'UNAUTHENTICATED');
  }
}

