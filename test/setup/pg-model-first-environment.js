// jest doesn't support ts-jest for test environment files
// so it has to be pure javascript
const NodeEnvironment = require("jest-environment-node");

class PgModelFirstEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    // we could use process.env.__PGCONNSTRING_MODEL_FIRST__ directly in the tests, but
    // its a bug so when a fix is release, we can adapt proper solution here
    // check https://github.com/facebook/jest/issues/7184#issuecomment-492122367
    const connString = process.env.__PGCONNSTRING_MODEL_FIRST__;
    if (!connString) {
      throw new Error(
        "__PGCONNSTRING_MODEL_FIRST__ is not set, check setup.ts"
      );
    }

    this.global.__PGCONNSTRING__ = connString;
  }
}

module.exports = PgModelFirstEnvironment;
