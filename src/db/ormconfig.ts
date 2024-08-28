import { DataSource } from "typeorm";
import { cardsData } from "../constants/index";
import { Card } from "./entities/Card";

const boardSize =
  Number(process.env.BOARD_SIZE) * 2 + (Number(process.env.BOARD_SIZE) - 2) * 2;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOSST || "localhost",
  port: 5432,
  username: process.env.DB_USERNAME || "admin",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_DATABASE || "admin",
  synchronize: process.env.ENV == "dev" ? true : false,
  logging: false,
  entities: [__dirname + "/entities/*.{ts,js}"],
  migrations: [__dirname + "/migrations/*.{ts,js}"],
  subscribers: [],
  migrationsTableName: "migrations",
});

export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    if (process.env.ENV === "dev") {
      const entities = AppDataSource.entityMetadatas;

      for (const entity of entities) {
        const repository = AppDataSource.getRepository(entity.name);
        await repository.query(
          `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`
        );
        if (entity.name === "Card") {
          for (let i = 0; i <= boardSize; i++) {
            const card = new Card();
            card.name = cardsData[i].name;
            card.description = cardsData[i].description;
            card.is_tradable = cardsData[i].is_tradable;
            card.illustration_url =
              "https://avatars.githubusercontent.com/u/65620069?v=4";
            card.type = "def";
            card.purchase_value = 100.0;
            card.modifiers = "def";
            card.can_accept_modifiers = cardsData[i].is_tradable;
            card.rarity_tier = 1;
            card.scaling_level = 1;
            card.quantity = 1;

            await repository.save(card);
          }
        }
      }

      console.log("All tables have been cleared in development environment.");
    }
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
  }
};
