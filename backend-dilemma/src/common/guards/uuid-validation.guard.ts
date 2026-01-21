import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { validate as uuidValidate } from 'uuid';

@Injectable()
export class UuidValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userUuid = request.headers['x-user-uuid'];

    if (!userUuid) {
      throw new BadRequestException('X-User-UUID header is required');
    }

    if (!uuidValidate(userUuid)) {
      throw new BadRequestException('Invalid UUID format in X-User-UUID header');
    }

    return true;
  }
}
