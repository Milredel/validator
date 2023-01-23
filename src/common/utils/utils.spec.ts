import { Utils } from './utils';
import { expect } from '../../test';

describe('Utils', () => {

    describe('compareObjects', () => {
        it('should return true if given objects are identical', () => {
            const res = Utils.compareObjects({some: 'prop1'}, {some: 'prop1'});
            return (expect(res) as any).to.be.deep.eq(true);
        });

        it('should return false if given objects are not identical', () => {
            const res = Utils.compareObjects({some: 'prop1'}, {some: 'prop2'});
            return (expect(res) as any).to.be.deep.eq(false);
        });
    });

    describe('isEmpty', () => {
        it('should return true if given object is empty', () => {
            const res = Utils.isEmpty({});
            return (expect(res) as any).to.be.deep.eq(true);
        });

        it('should return false if given object is not empty', () => {
            const res = Utils.isEmpty({some: 'prop1'});
            return (expect(res) as any).to.be.deep.eq(false);
        });
    });

});
