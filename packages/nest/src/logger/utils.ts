import { TransformableInfo } from "logform"
import { yellow, red, green, magenta, cyan, blue, gray } from "./colors"
import { format as winstonFormat } from "winston"

const LOG_LENGTH_LIMIT = 1024 * 256

export const prettyPrint = (info: TransformableInfo): string => {
  const { level, message, timestamp, time: _time, ...meta } = info
  let messageColorizer: Function
  switch (level) {
    case "warn":
      messageColorizer = yellow

      break
    case "error":
      messageColorizer = red

      break
    case "info":
      messageColorizer = green

      break
    case "debug":
      messageColorizer = magenta

      break
    default:
      messageColorizer = yellow

      break
  }

  let metaStr = ""
  Object.entries(meta).forEach(([key, value]) => {
    let valueStr = value
    if (value instanceof Date) {
      valueStr = value.valueOf() // Serialize Date to numeric epoch
    } else if (Object(value) === value) {
      // Handle generic objects
      valueStr = ""

      Object.entries(value).forEach(([objKey, objValue]) => {
        let objValueStr = objValue
        if (Object(objValue) === objValue) {
          objValueStr = JSON.stringify(objValue)
        }

        valueStr += `${cyan(objKey)}=${objValueStr} `
      })

      valueStr = `{ ${valueStr} }`
    }

    metaStr += `${blue(key)}=${valueStr} `
  })

  return `[${gray(timestamp)}] ${messageColorizer(level)}: ${messageColorizer(
    message,
  )} ${metaStr}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sanitizedMetadata = (meta: any) => {
  const metaDataLength = meta ? JSON.stringify(meta).length : 0
  if (metaDataLength > LOG_LENGTH_LIMIT) {
    return {
      truncated: true,
      contextSize: metaDataLength,
      logLengthLimit: LOG_LENGTH_LIMIT,
      firstKey: Object.keys(meta)[0],
    }
  }

  return meta
}

const sanitize = (info: TransformableInfo): TransformableInfo => {
  const { message, level, ...meta } = info

  info.time = new Date().toISOString()

  info.severity = level

  const sanitizedMeta = sanitizedMetadata(meta)
  if (sanitizedMeta.truncated) {
    info = { ...info, ...sanitizedMeta }
  }

  const isSanitized = sanitizedMeta && sanitizedMeta.truncated

  if (isSanitized) {
    info.message = `[DROPPED METADAT] ${message}`
  }

  return info
}

export const sanitizeFormat = winstonFormat(sanitize)

const addError = (info: TransformableInfo): TransformableInfo => {
  const { message, level, ...meta } = info
  let infoMessage = ""

  if (level === "error" || level == "warn") {
    if (meta?.stack) {
      infoMessage = `${message}\n${meta.stack}`
    } else if (meta?.error?.stack) {
      infoMessage = `${message}\n${meta.error.stack}`
    } else {
      infoMessage = new Error(message).stack!
    }

    const cause = meta?.cause

    if (cause?.stack) {
      infoMessage += `\nCaused by:\n${cause.message}\n${cause.stack}`
    } else if (cause?.error?.stack) {
      infoMessage += `\nCaused by:\n${cause.message}\n${cause.error.stack}`
    }

    info.message = infoMessage
  }

  return info
}

export const addErrorFormat = winstonFormat(addError)
