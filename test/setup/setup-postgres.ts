import * as path from "path";
import logger from "src/logger";
import { GenericContainer } from "testcontainers";

interface SetupPostgres {
  connString1: string;
  connString2: string;
  container: {
    stop: () => Promise<void>;
  };
}

export default async function setupPostgres(
  dbname1: string,
  dbname2: string
): Promise<SetupPostgres> {
  const port = 5432;
  const user = "test";
  const password = "test";

  logger.log(
    "Starting Docker Postgres container, this will take a while for the first run ..."
  );

  const buildContext = path.resolve(__dirname, "__setup-postgres__");

  const base = await GenericContainer.fromDockerfile(buildContext).build();
  const container = await base
    .withExposedPorts(port)
    .withEnv("POSTGRES_USER", user)
    .withEnv("POSTGRES_PASSWORD", password)
    .withEnv("POSTGRES_DB1", dbname1)
    .withEnv("POSTGRES_DB2", dbname2)
    .start();

  const host = container.getContainerIpAddress();
  const mappedPort = container.getMappedPort(port);

  return {
    container: {
      async stop(): Promise<void> {
        await container.stop();
      }
    },
    connString1: `postgres://${user}:${password}@${host}:${mappedPort}/${dbname1}`,
    connString2: `postgres://${user}:${password}@${host}:${mappedPort}/${dbname2}`
  };
}
