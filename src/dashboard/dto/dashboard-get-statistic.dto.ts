import { IsOptional, IsString } from "class-validator";

export class DashboardStatisticDTO {
    @IsOptional()
    @IsString()
    date_start?: Date;
}