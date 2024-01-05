import { Controller, Request, Get, Body, Post, HttpStatus, Req, Res, Inject, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ValidationDataDto } from './common/dto/validationData.dto';
import { AppService } from './app.service';
import { Utils } from './common/utils/utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto } from './common/dto/file.dto';
import { diskStorage } from 'multer';
import { validate, validateOrReject } from 'class-validator';

@Controller()
export class AppController {

    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
        private appService: AppService,
    ) { }

    /**
     * Utility endpoint for test
     *
     * @returns 'Hello World!'
     */
    @Get()
    helloWorld(): string {
        this.logger.info('Hello World!');
        return 'Hello World!';
    }

    /**
     * Compute validation and return result accordingly
     *
     * @returns response
     */
    @Post('/movements/validation')
    validation(@Body() validationDataDto: ValidationDataDto, @Res() response) {

        const {reasons, mergedData} = this.appService.validate(validationDataDto);

        if (reasons) {
            response.status(HttpStatus.ACCEPTED);
            return response.send({statusCode: HttpStatus.ACCEPTED, reasons: reasons, content: mergedData});
        }

        response.status(HttpStatus.ACCEPTED);
        return response.send({statusCode: HttpStatus.ACCEPTED, content: mergedData});
    }

    /**
     * Compute validation by file and return result accordingly
     *
     * @returns response
     */
    @Post('/movements/validation/file')
    async validationByFile(@Body() file: FileDto, @Res() response) {
        let data
        try {
            const content = this.appService.getContentFromFile(file.name);
            const toValidate = new ValidationDataDto()
            toValidate.movements = content.movements
            toValidate.balances = content.balances
            await validateOrReject(toValidate)
            const {reasons, mergedData} = this.appService.validate(toValidate);
            data = mergedData
            this.appService.deleteFile(file.name); // maybe not a good solution here, we might want to keep the file further along
            if (reasons) {
                response.status(HttpStatus.ACCEPTED);
                return response.send({statusCode: HttpStatus.ACCEPTED, reasons: reasons, content: data});
            }
        } catch (error) {
            response.status(HttpStatus.INTERNAL_SERVER_ERROR);
            return response.send({statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: error});
        }

        response.status(HttpStatus.ACCEPTED);
        return response.send({statusCode: HttpStatus.ACCEPTED, content: data});
    }

    /**
     * Receive a file (json only), store it on disk and send the server file name back
     *
     * @returns response
     */
    @UseInterceptors(FileInterceptor('file', {storage: diskStorage({destination: './uploads', filename: Utils.editFileName})}))
    @Post('file')
    uploadFile(
        @UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({
                fileType: 'json',
            })
            .build({
                fileIsRequired: false,
            }),
        )
        file?: Express.Multer.File,
    ) {
        return {
            fileName: file?.filename,
        };
    }

}