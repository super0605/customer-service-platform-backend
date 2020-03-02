import * as bodyParser from "body-parser";
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import { corsMiddleware, errorMiddleware } from "./middlewares";
import { Sequelize } from "./sequelize";

export type App = express.Express;

interface AppOptions {
  sequelize: Sequelize; // its implicitly required by all the models so we make this requirement explicit, although it is not used directly
  tsoaBuildDir: string;
}

export function mkApp({ tsoaBuildDir }: AppOptions): App {
  // we have to use normal require because these dependencies
  // are dynamically built using generateTsoa
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { RegisterRoutes } = require(`${tsoaBuildDir}/routes`);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const swaggerDocument = require(`${tsoaBuildDir}/swagger.json`);

  const app = express();

  // TODO: set up rate limiter
  app.use("/v1", corsMiddleware);
  app.use(bodyParser.json({ limit: "5mb" }));
  app.use(
    ["/docs", "/v1/docs"],
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
  RegisterRoutes(app);
  app.use(errorMiddleware);

  return app;
}
