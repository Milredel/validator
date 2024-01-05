import { Injectable } from "@nestjs/common";
import { ValidationDataDto } from "./common/dto/validationData.dto";
import * as fs from 'fs';

@Injectable()
export class FileService {

    constructor() {
        // nothing to see here
    }

    getContentFromFile(fileName: string, prefix = 'uploads') {
        const data = fs.readFileSync(`./${prefix}/` + fileName , 'utf8')
        return JSON.parse(data)
    }

    deleteFile(fileName: string) {
        fs.unlinkSync('./uploads/' + fileName)
    }

    createFile(data: ValidationDataDto): string {
        const serverFileName = crypto.randomUUID() + '.json';
        fs.writeFileSync('./uploads/' + serverFileName, JSON.stringify(data, null, 4))
        return serverFileName
    }

}
