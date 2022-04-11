import { CurrencySeed } from 'src/constants/seed';
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';

export class Seeding1649675153104 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    await getRepository('currency').save(CurrencySeed);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //
  }
}
