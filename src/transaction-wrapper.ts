import { IsolationLevel } from "typeorm/driver/types/IsolationLevel";
import { DataSource, QueryRunner } from "typeorm";

export async function withTransaction<T>(
  dataSource: DataSource,
  callback: (queryRunner: QueryRunner) => Promise<T>,
  isolationLevel: IsolationLevel = "READ COMMITTED"
): Promise<T> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction(isolationLevel);

  try {
    const result = await callback(queryRunner);
    await queryRunner.commitTransaction();
    return result;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
