import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { isObject } from 'class-validator';
import { FastifyReply } from 'fastify';
import { Observable, throwError } from 'rxjs';
import { WinstonLogger } from '../logger/logger';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLogger) {}

  catch(
    exception: (Error) & { statusCode?: number },
    host: ArgumentsHost,
  ): Observable<unknown> {
    const { headers, user } = this.getRequestFromContext(host);

    if (exception.message && exception.statusCode) {
      this.logger.error({
        headers,
        user,
        exception,
      });

      return this.buildResponseFromContext(host, exception);
    }

    const httpException = <HttpException>exception;

    if (httpException.getResponse) {
      const res = httpException.getResponse();

      const error = isObject(res) ? res : { message: res };

      this.logger.error({
        headers,
        user,
        error,
      });

      return this.buildResponseFromContext(host, {
        statusCode: httpException.getStatus(),
        ...error,
      });
    }

    const stack = exception.stack || undefined;

    this.logger.error({
      headers,
      user,
      exception,
      stack,
    });

    return this.buildResponseFromContext(host, {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal Server Error',
    });
  }

  private getRequestFromContext(host: ArgumentsHost): any {
    const contextType = host.getType<GqlContextType | 'http' | 'rpc' | 'ws'>();

    switch (contextType) {
      case 'http':
        return host.switchToHttp().getRequest();
      case 'graphql': {
        const gqlHost = GqlArgumentsHost.create(host);
        const ctx = gqlHost.getContext();
        return ctx.req || ctx.request || {};
      }
      case 'rpc':
        return host.switchToRpc().getData();
      case 'ws':
        return host.switchToWs().getData();
      default: {
        const unhandledType: never = contextType;

        throw new BadRequestException(
          `Unhandled execution context type ${unhandledType as string}`,
        );
      }
    }
  }

  private buildResponseFromContext(host: ArgumentsHost, response: unknown): Observable<unknown> {
    const contextType = host.getType<GqlContextType | 'http' | 'rpc' | 'ws'>();

    switch (contextType) {
      case 'http': {
        const res = host.switchToHttp().getResponse<FastifyReply>();
        res.status(
          (<{ statusCode: number }>response)?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR,
        );
        return res.send(response) as any;
      }
      case 'graphql':
        return throwError(() => response);
      case 'rpc':
      case 'ws':
        return throwError(() => response);
      default: {
        const unhandledType: never = contextType;

        throw new BadRequestException(
          `Unhandled execution context type ${unhandledType as string}`,
        );
      }
    }
  }
}
