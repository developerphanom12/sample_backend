import { Injectable } from '@nestjs/common';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}
  createTypeOrmOptions() {
    return  {
      type: "postgres" as "postgres",
      host: this.configService.get('DB_HOST'),
      port: 5432,
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      synchronize: true,
      //dropSchema: true,
      logging: false,
      entities: ['dist/**/*.entity.js'],
      subscribers: ['dist/**/*.subscriber.js'],
      migrationsTableName: 'migration',
      migrations: ['dist/migration/*.js'],
      cli: {
        migrationsDir: 'src/migration',
      },
      seeds: ['src/seeds/**/*.seed.js'],
      factories: ['src/factories/**/*.factory.js'],
    }
  }
}
