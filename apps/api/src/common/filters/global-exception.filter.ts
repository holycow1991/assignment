import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Request, Response } from "express";

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();
    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body: ErrorResponseBody = {
      statusCode,
      message: this.extractMessage(exception),
      path: request.originalUrl ?? request.url,
      timestamp: new Date().toISOString(),
    };

    const logContext = "GlobalExceptionFilter";
    const metadata = {
      method: request.method,
      path: body.path,
      statusCode,
    };

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const trace = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(
        `${request.method} ${body.path} failed`,
        trace,
        JSON.stringify(metadata),
      );
    } else {
      this.logger.warn(
        `${request.method} ${body.path} failed: ${Array.isArray(body.message) ? body.message.join(", ") : body.message}`,
        JSON.stringify(metadata),
      );
    }

    response.status(statusCode).json(body);
  }

  private extractMessage(exception: unknown): string | string[] {
    if (!(exception instanceof HttpException)) {
      return "Internal server error";
    }

    const response = exception.getResponse();

    if (typeof response === "string") {
      return response;
    }

    if (
      typeof response === "object" &&
      response !== null &&
      "message" in response
    ) {
      const message = response.message;
      if (typeof message === "string" || Array.isArray(message)) {
        return message;
      }
    }

    return exception.message;
  }
}
