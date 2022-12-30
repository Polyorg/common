import { Module } from "@nestjs/common"
import { WinstonModule } from "nest-winston"
import { winstonConfigFactory } from "./config.factory"

@Module({})
export class PolyLoggerModule {
  static register(service: string) {
    return WinstonModule.forRootAsync({
      useFactory: () => winstonConfigFactory(service),
    })
  }
}
