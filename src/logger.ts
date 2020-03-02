import * as winston from "winston";
import env from "./env";

const customFormat = winston.format.printf(info => {
  const { timestamp: tmsmp, level, message, ...rest } = info;
  let log = "";
  if (tmsmp) {
    log = `${tmsmp} - `;
  }
  log = `${log}${level}:\t${message}`;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objs = (rest as any)[Symbol.for("splat")] || [];
  for (const obj of objs) {
    log = `${log}\n${JSON.stringify(
      obj,
      (key, value) => {
        if (key === "stack") return undefined;
        return value;
      },
      2
    )}`;
    if (obj.stack) log = `${log}\n${obj.stack}`;
  }
  return log;
});

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: winston.format.combine(
    // winston.format.timestamp({
    //   format: "YYYY-MM-DD HH:mm:ss"
    // }),
    ...(env.isDev ? [winston.format.colorize({ all: true })] : []),
    // winston.format.align(),
    customFormat
  ),
  transports: [new winston.transports.Console()]
});

export default {
  log(arg: string, ...args: unknown[]) {
    logger.log("info", arg, ...args);
  },
  debug(arg: string, ...args: unknown[]) {
    logger.log("debug", arg, ...args);
  },
  error(arg: string, ...args: unknown[]) {
    logger.log("error", arg, ...args);
  },
  warn(arg: string, ...args: unknown[]) {
    logger.log("warn", arg, ...args);
  },
  disable() {
    for (const t of logger.transports) {
      t.silent = true;
    }
  },
  enable() {
    for (const t of logger.transports) {
      t.silent = false;
    }
  }
};
