import { CurrencySeed } from '../constants/seed';
import { getRepository, MigrationInterface, QueryRunner } from 'typeorm';

export class Seeding1649685951420 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<void> {
    await getRepository('currency').save(CurrencySeed);
  }

  public async down(_: QueryRunner): Promise<void> {}
}
