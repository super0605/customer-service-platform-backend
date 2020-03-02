import * as st from "sequelize-typescript";
import models from "./models";
import logger from "./logger";

export type Sequelize = st.Sequelize;

export function mkSequelize(uri: string): st.Sequelize {
  return new st.Sequelize(uri, {
    models,
    logging: sql => logger.debug(sql)
  });
}
