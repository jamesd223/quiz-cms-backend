import pino, {
  type LoggerOptions,
  type TransportSingleOptions,
  type TransportMultiOptions,
} from "pino";

const isProduction = process.env.NODE_ENV === "production";

const baseOptions: LoggerOptions = {
  level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),
};

const devTransport = isProduction
  ? undefined
  : ({
      target: "pino-pretty",
      options: { colorize: true, translateTime: "SYS:standard" },
    } as unknown as TransportSingleOptions);

export const logger = pino({
  ...baseOptions,
  ...(devTransport ? { transport: devTransport } : {}),
});

export default logger;
