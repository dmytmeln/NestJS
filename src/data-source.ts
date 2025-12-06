import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const dataSourceConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.EVENT_DB_HOST || 'localhost',
  port: parseInt(process.env.EVENT_DB_PORT || '5432', 10),
  username: process.env.EVENT_DB_USERNAME || 'postgres',
  password: process.env.EVENT_DB_PASSWORD || 'postgres',
  database: process.env.EVENT_DB_NAME || 'postgres',
  synchronize: false,
  logging: false,
  entities: ['dist/**/*.entity{.js,.ts}'],
  migrations: ['dist/**/migrations/*{.js,.ts}'],
};
export const AppDataSource = new DataSource(dataSourceConfig);
