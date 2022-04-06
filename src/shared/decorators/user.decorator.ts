import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const User = createParamDecorator(
  async (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization;
    const [_bearer, token] = header.split(' ');
    const resp: any = jwt.decode(token);
    return data ? resp?.[data] : resp;
  },
);
