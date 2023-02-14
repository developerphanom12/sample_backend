import { Module } from '@nestjs/common';
import { ClearBooksController } from './clear-books.controller';
import { ClearBooksService } from './clear-books.service';

@Module({
  controllers: [ClearBooksController],
  providers: [ClearBooksService]
})
export class ClearBooksModule {}
