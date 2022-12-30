import { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common"
import { Request, Response } from "express"
import { map } from "rxjs"
import { createLogger } from "winston"
import { winstonConfigFactory } from "./config.factory"

export class LoggerInterceptor implements NestInterceptor {
  constructor(private service: string) {
    this.service = service
  }

  intercept(context: ExecutionContext, handler: CallHandler<any>) {
    const req = context.switchToHttp().getRequest<Request>()
    const res = context.switchToHttp().getResponse<Response>()

    const logger = createLogger(winstonConfigFactory(this.service))

    return handler.handle().pipe(
      map((data) => {
        const logData = {
          response: {
            status: res.statusCode,
            data,
          },
          request: {
            method: req.method,
            body: req.body,
            query: req.query,
            path: req.originalUrl,
          },
        }

        logger.info("Http Request", logData)

        return data
      }),
    )
  }
}
