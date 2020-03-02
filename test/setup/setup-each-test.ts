import logger from "src/logger";

const isDebug =
  typeof global.v8debug === "object" ||
  /--debug|--inspect/.test(process.execArgv.join(" "));

if (isDebug) {
  // massive timeout for step debugging
  jest.setTimeout(2137 * 1000);
}

beforeAll(() => {
  logger.disable();
});

afterAll(() => {
  logger.enable();
});

// TODO: how to tell typescript about it?
expect.extend({
  toBeType(received, argument) {
    const initialType = typeof received;
    const type =
      initialType === "object"
        ? Array.isArray(received)
          ? "array"
          : initialType
        : initialType;
    return type === argument
      ? {
          message: () => `expected ${received} to be type ${argument}`,
          pass: true
        }
      : {
          message: () => `expected ${received} to be type ${argument}`,
          pass: false
        };
  }
});

expect.extend({
  toContainObject(received, argument) {
    const pass = this.equals(
      received,
      expect.arrayContaining([expect.objectContaining(argument)])
    );

    if (pass) {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} not to contain object ${this.utils.printExpected(argument)}`,
        pass: true
      };
    } else {
      return {
        message: () =>
          `expected ${this.utils.printReceived(
            received
          )} to contain object ${this.utils.printExpected(argument)}`,
        pass: false
      };
    }
  }
});
