import { IsOptional, IsUUID } from "class-validator";

export class RefetchEventsParamsDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}
