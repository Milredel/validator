import { IsObject, IsString } from "class-validator";
import { ValidationDataDto } from "./validationData.dto";

export class CreateValidationDto {
    @IsObject()
    data: ValidationDataDto;

    @IsString()
    fileName: string;
}