import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import { jest } from "@jest/globals";
import { resolve } from "node:path";

loadEnv({ path: resolve(__dirname, "../../.env.test"), quiet: true });

jest.setTimeout(30000);
