import * as mkdirp from "mkdirp";
import * as path from "path";
import * as tsoa from "tsoa";
import { SwaggerConfig } from "tsoa";
import * as url from "url";
import { promisify } from "util";
import env from "./env";
import logger from "./logger";

const asyncMkdirp = promisify(mkdirp);

interface HostTsoaSwaggerOptions {
  host: string;
  schemes: string[];
}

export interface GenerateTsoaOptions {
  force?: boolean;
  iocModule?: string;
  output?: string;
}

export interface GenerateTsoaResult {
  output: string;
}

function extractHostTsoaSwaggerOptions(
  swagger: SwaggerConfig
): HostTsoaSwaggerOptions {
  if (swagger.host) {
    throw new Error(
      `'tsoaConfig.json' has 'swagger.host' property, but it should be set up automatically`
    );
  }
  if (swagger.schemes) {
    throw new Error(
      `'tsoaConfig.json' has 'swagger.schemes' property, but it should be set up automatically`
    );
  }

  const parsed = url.parse(env.ROOT_URL);
  if (!parsed.protocol) {
    throw new Error(`'env.ROOT_URL' must include protocol`);
  }
  if (!parsed.host) {
    throw new Error(`'env.ROOT_URL' must include host`);
  }

  const protocolWithoutColon = parsed.protocol.substr(
    0,
    parsed.protocol.length - 1
  );
  return {
    host: parsed.host,
    schemes: [protocolWithoutColon]
  };
}

/**
 * @param force If true, forces a generation even if EXPLICIT_TSOA_BUILD is not set.
 */
export default async function generateTsoa({
  force = false,
  iocModule,
  output = "build"
}: GenerateTsoaOptions = {}): Promise<GenerateTsoaResult> {
  const outDir = path.resolve(__dirname, "..", output);

  if (env.isProduction && !force) {
    logger.log(
      `Production mode, skipping automatic tsoa generation. Use 'npm run gen:tsoa' for explicit build.`
    );
    return {
      output: outDir
    };
  }

  if (env.EXPLICIT_TSOA_BUILD && !force) {
    logger.log(
      `'EXPLICIT_TSOA_BUILD' is specified, skipping automatic tsoa generation. Use 'npm run gen:tsoa' for explicit build.`
    );
    return {
      output: outDir
    };
  }

  // TODO: is there a way to import json "as const" in the sense of
  // not broading string-like values to string? then we won't need "any" conversion
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tsoaConfig: any;
  try {
    tsoaConfig = require("../tsoaConfig.json");
  } catch (err) {
    logger.log(
      `Could not find 'tsoaConfig.json', skipping tsoa generation (this is expected for running precompiled app)`
    );
    return {
      output: outDir
    };
  }

  logger.log(`Generating tsoa routes and openapi at ${outDir} ...`);
  await asyncMkdirp(outDir);

  const swaggerOpts = {
    ...tsoaConfig.swagger,
    ...extractHostTsoaSwaggerOptions(tsoaConfig.swagger),
    ...(output ? { outputDirectory: outDir } : {}),
    noImplicitAdditionalProperties: env.THROW_ON_EXTRA_REQUEST_PARAMETERS
      ? "throw-on-extras"
      : "silently-remove-extras"
  };

  const routesOpts = {
    ...tsoaConfig.routes,
    ...(iocModule ? { iocModule } : {}),
    ...(output ? { routesDir: outDir } : {})
  };

  await Promise.all([
    tsoa.generateRoutes(routesOpts, swaggerOpts, tsoaConfig.compilerOptions),
    tsoa.generateSwaggerSpec(
      swaggerOpts,
      routesOpts,
      tsoaConfig.compilerOptions
    )
  ]);
  return {
    output: outDir
  };
}
