import logger from "src/logger";

export = async function(): Promise<void> {
  logger.log("Jest Global Teardown.");
  await global.__PGCONTAINER__.stop();
};
