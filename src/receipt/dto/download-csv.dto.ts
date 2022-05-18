import { ApiProperty } from '@nestjs/swagger';

export class DownloadCSVDTO {
  @ApiProperty()
  receipts: string[];
}
