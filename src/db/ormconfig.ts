import { DataSource } from "typeorm";

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
      }

      console.log("All tables have been cleared in development environment.");
    }
  } catch (error) {
    console.error("Error during Data Source initialization:", error);
  }
};
