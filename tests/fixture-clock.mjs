const fixtureTime = Date.parse('2026-11-13T12:00:00Z');
const NativeDate = Date;
globalThis.Date = new Proxy(NativeDate, {
  construct(target, args, newTarget) {
    return Reflect.construct(target, args.length ? args : [fixtureTime], newTarget);
  },
  apply() {
    return new NativeDate(fixtureTime).toString();
  },
  get(target, key, receiver) {
    return key === 'now' ? () => fixtureTime : Reflect.get(target, key, receiver);
  },
});
