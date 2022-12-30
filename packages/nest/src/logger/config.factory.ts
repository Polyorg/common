import { Format } from "logform"
import { WinstonModuleOptions } from "nest-winston"
import { transports, format as winstonFormat } from "winston"
import { addErrorFormat, prettyPrint, sanitizeFormat } from "./utils"

export const LEVEL = process.env.LOG_LEVEL || "info"

export const winstonConfigFactory = (service: string): WinstonModuleOptions => {
  let logFormat: Format = winstonFormat.combine(
    winstonFormat.timestamp({ format: "HH:MM:ss.SSS" }),
    winstonFormat.printf(prettyPrint),
  )

  return {
    defaultMeta: {
      service,
    },
    level: LEVEL,
    format: winstonFormat.combine(
      addErrorFormat(),
      sanitizeFormat(),
      logFormat,
    ),
    transports: [new transports.Console()],
  }
}
