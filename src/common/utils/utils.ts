import { extname } from "path";

export abstract class Utils {

    static compareObjects(o1: any, o2: any): boolean {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }

    static isEmpty(obj: any): boolean {
        return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
    }

    static editFileName = (_, file: Express.Multer.File, callback) => {
        const name = file.originalname.split('.')[0];
        const fileExtName = extname(file.originalname);
        const randomName = Array(4)
          .fill(null)
          .map(() => Math.round(Math.random() * 16).toString(16))
          .join('');
        callback(null, `${name}-${randomName}${fileExtName}`);
    }

    static cleanFileName = (fileName: string): string => fileName.replace(/(.*)-[a-z0-9]{4}\.json/, '$1-fixed.json')

}
