import { IsDate, IsOptional } from "class-validator";

export class DashboardStatisticDTO {
    @IsOptional()
    @IsDate()
    start_date?: Date;
}