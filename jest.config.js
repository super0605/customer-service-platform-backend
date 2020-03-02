require("dotenv").config();

const precompiled = process.env.TEST_COMPILED === "true";
if (precompiled) {
  console.log(
    `'TEST_COMPILED' is specified, using compiled sources from 'build/test/dist'`
  );
}

const shared = {
  ...(precompiled
    ? {
        setupFilesAfterEnv: [
          "<rootDir>/build/test/dist/test/setup/setup-each-test.js"
        ],
        testMatch: ["**/build/test/dist/test/**/*.test.js"]
      }
    : {
        globals: {
          "ts-jest": {
            compiler: "ttypescript"
          }
        },
        transform: {
          "^.+\\.ts$": "ts-jest"
        },
        setupFilesAfterEnv: ["<rootDir>/test/setup/setup-each-test.ts"],
        testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$"
      }),
  testEnvironment: "node"
};

const sharede2e = {
  ...shared,
  ...(precompiled
    ? {
        globalSetup: "<rootDir>/build/test/dist/test/setup/setup-e2e.js",
        globalTeardown: "<rootDir>/build/test/dist/test/setup/teardown-e2e.js",
        testMatch: ["**/build/test/dist/test/**/*.e2e.js"]
      }
    : {
        globalSetup: "<rootDir>/test/setup/setup-e2e.ts",
        globalTeardown: "<rootDir>/test/setup/teardown-e2e.ts",
        testRegex: "(/__tests__/.*|(\\.|/)e2e)\\.ts$"
      })
};

const unitProject = {
  ...shared,
  displayName: "UNIT"
};
// const modelFirstProject = {
//   ...sharede2e,
//   displayName: "MODEL_FIRST",
//   testEnvironment: "<rootDir>/test/setup/pg-model-first-environment.js"
// };
const dbFirstProject = {
  ...sharede2e,
  displayName: "DB_FIRST",
  testEnvironment: "<rootDir>/test/setup/pg-db-first-environment.js"
};

const testSuite = process.env.TEST_SUITE || "all";
console.log(`TEST_SUITE=${testSuite}`);
const projects = testSuite
  .split(",")
  .map(s => s.trim())
  .reduce((acc, curr) => {
    let toAdd = [];
    switch (curr) {
      case "all":
        toAdd = [unitProject, dbFirstProject];
        break;
      case "unit":
        toAdd = [unitProject];
        break;
      case "db-first":
        toAdd = [dbFirstProject];
        break;
      // BUG: I'm too tired to deal with Sequelize nonsense in creating tables
      // unexpected unique constraints in random tables because of random statements ...
      // drives me crazy, so just turn it off for the time being.
      // Not very necessary anyway.
      // case "model-first":
      //   toAdd = [modelFirstProject];
      //   break;
      default:
        throw new Error(`unknown test suite: '${curr}'`);
    }
    return acc.concat(toAdd);
  }, []);

for (const project of projects) {
  console.log(`Using ${project.displayName} test suite`);
}

module.exports = {
  projects
};
