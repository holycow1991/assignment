import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class GetEventByIdDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  id!: string;
}
