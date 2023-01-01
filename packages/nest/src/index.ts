export * from "./logger"
export { WINSTON_MODULE_PROVIDER as POLY_LOGGER_PROVIDER } from "nest-winston"
export {
  Logger as PolyLogger,
  transports as Transports,
  createLogger as CreateLogger,
} from "winston"
