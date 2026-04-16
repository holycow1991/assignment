import type { Config } from "jest";

const config: Config = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  setupFilesAfterEnv: ["<rootDir>/test/setup/jest.setup.ts"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.e2e-spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
      },
    ],
  },
};

export default config;
