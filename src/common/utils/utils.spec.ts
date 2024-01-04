import { Utils } from './utils';

describe('Utils', () => {

    describe('compareObjects', () => {
        test('should return true if given objects are identical', () => {
            const res = Utils.compareObjects({some: 'prop1'}, {some: 'prop1'});
            expect(res).toBe(true);
        });

        it('should return false if given objects are not identical', () => {
            const res = Utils.compareObjects({some: 'prop1'}, {some: 'prop2'});
            expect(res).toBe(false);
        });
    });

    describe('isEmpty', () => {
        it('should return true if given object is empty', () => {
            const res = Utils.isEmpty({});
            expect(res).toBe(true);
        });

        it('should return false if given object is not empty', () => {
            const res = Utils.isEmpty({some: 'prop1'});
            expect(res).toBe(false);
        });
    });

});
