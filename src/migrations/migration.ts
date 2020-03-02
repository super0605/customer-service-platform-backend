import { Sequelize } from "src/sequelize";

export default interface Migration {
  name: string;
  up: (sequelize: Sequelize) => Promise<void>;
  down?: (sequelize: Sequelize) => Promise<void>;
}
