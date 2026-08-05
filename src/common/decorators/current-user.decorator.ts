import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '@core/auth/types/authenticated-user';

export const CurrentUser = createParamDecorator(
  (field: keyof AuthenticatedUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{
      user: AuthenticatedUser;
    }>();

    if (field) {
      return request.user[field];
    }

    return request.user;
  },
);
