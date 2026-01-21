import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserUuid = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-user-uuid'];
  },
);
