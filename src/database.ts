import { DataSource } from "typeorm";
import { User } from "@src/entities/user.entity";
import { Profile } from "@src/entities/profile.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "transaction-test",
  entities: [User, Profile],
  // Just for preview
  synchronize: true,
});
