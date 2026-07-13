import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type Role } from '@prisma/client';

/** Shape attached to `request.user` by the JWT strategy. */
export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Injects the authenticated user (or a single field of it) into a handler.
 * Usage: `@CurrentUser() user: AuthenticatedUser` or `@CurrentUser('sub') id: string`.
 */
export const CurrentUser = createParamDecorator(
  (
    field: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    return field ? user[field] : user;
  },
);
