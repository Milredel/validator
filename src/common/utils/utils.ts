export abstract class Utils {

    static compareObjects(o1: any, o2: any): boolean {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }

    static isEmpty(obj: any): boolean {
        return obj && Object.keys(obj).length === 0 && Object.getPrototypeOf(obj) === Object.prototype;
    }

}
