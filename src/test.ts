import 'mocha';
import * as sinon from 'sinon';
import { SinonStub } from 'sinon';
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { Subject } from 'rxjs';
import 'mock-local-storage';
import ExpectStatic = Chai.ExpectStatic;

chai.should();       // to activate usage of should
chai.use(sinonChai); // to link sinonChai

const sandbox = sinon.createSandbox();

export const expect: ExpectStatic = chai.expect;
export const stub: any = (object: any, property: string, descriptor: any): Stub => {
  if (object && object[property] && object[property].returns) { // already stubbed?
    return object[property];
  } else {
    return sandbox.stub(object, property).callsFake(descriptor);
  }
};

afterEach(() => {
  sandbox.restore(); // reset all spies
});

export const useFakeTimers = sinon.useFakeTimers;

export type Stub = SinonStub;

let stubResetsNumber = 0;

const resetStubIfNeeded = (theStub: any, error: Error) => {
  // if stubClass wasn't called from beforeEach, we should reset the spies so that one can use it
  // outside of beforeEach,
  const aRegexResult = /(\w+)@|at (\w+) \(/g.exec(error.stack);
  const sCallerName = aRegexResult[1] || aRegexResult[2];
  const methods = Object.getOwnPropertyNames(theStub);

  if (sCallerName === 'loader') { // check caller is not from beforeEach
    beforeEach(() => {
      stubResetsNumber++;
      methods.forEach((key) => {
        if (theStub[key] && !theStub[key].returns) {
          sandbox.stub(theStub, key);
        }
      });
    });
  }
};

export const createStub = (name: string, methods: string[] | string = []) => {
  const theStub = {name};
  if (!Array.isArray(methods)) {
    methods = [methods];
  }
  for (const method of methods) {
    theStub[method] = (): any => null;
    sandbox.stub(theStub, method);
  }
  resetStubIfNeeded(theStub, new Error());
  return theStub as any;
};

export function stubClass<T>(clazz: new(...args: any[]) => T, defaults: any = {}): T {
  let methods: string[] = [];
  let proto = clazz.prototype;
  while (proto !== Object.prototype) {
    // get super class methods as well (one lvl)
    methods = methods.concat(Object.getOwnPropertyNames(proto));
    proto = Object.getPrototypeOf(proto);
  }

  const theStub = createStub((clazz).name, methods);

  Object.keys(defaults).forEach(key => {
    theStub[key] = defaults[key];
    if (typeof defaults[key] === 'function') {
      sandbox.stub(theStub, key).callThrough();
    }
  });

  resetStubIfNeeded(theStub, new Error());
  return theStub as T;
}

export const objectContaining = (stuff: any) => sinon.match(stuff);
export const createEventStub = () => createStub('event', ['preventDefault', 'stopPropagation']) as any;
export const createStoreStub = () => {
  const storeStub = createStub('store', ['select', 'dispatch']) as any;
  storeStub.select.returns(new Subject());
  return storeStub;
}; // as Store<State>?

declare global { // add 'returns', 'resolve', 'reject' functions to methods so we don't have to do <Stub> casting anymore (you're welcome)
  export interface Function {
    returns(obj: any): void;

    resolves(obj: any): void;

    rejects(obj: any): void;

    throws(obj: any): void;

    callsFake(obj: any): void;

    onCall(obj: any): SinonStub;

    callThrough(): void;

    withArgs(obj: any): any;


    // ...you can add others from SinonStub if needed
  }
}

export const resolves = (stuff?) => Promise.resolve(stuff === undefined ? {} : stuff);
export const rejects = (stuff?) => Promise.reject(stuff === undefined ? {} : stuff);
export const createMockedLocalStorage = () => {
  return {setItem: () => null, getItem: () => null, removeItem: () => null};
};
