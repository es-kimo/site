export const extend2DMap = <K1, K2, V>(baseMap: Map<K1, Map<K2, V>>) => {
  return {
    map: baseMap,

    set(key1: K1, key2: K2, value: V) {
      if (!baseMap.has(key1)) {
        baseMap.set(key1, new Map());
      }
      baseMap.get(key1)!.set(key2, value);
      return this;
    },

    get(key1: K1, key2: K2): V | undefined {
      return baseMap.get(key1)?.get(key2);
    },

    has(key1: K1, key2: K2): boolean {
      return baseMap.get(key1)?.has(key2) ?? false;
    },

    delete(key1: K1, key2: K2): boolean {
      const inner = baseMap.get(key1);
      if (!inner) return false;
      const deleted = inner.delete(key2);
      if (inner.size === 0) baseMap.delete(key1);
      return deleted;
    },

    keys(): [K1, K2][] {
      const out: [K1, K2][] = [];
      for (const [k1, inner] of baseMap.entries()) {
        for (const k2 of inner.keys()) {
          out.push([k1, k2]);
        }
      }
      return out;
    },

    raw(): Map<K1, Map<K2, V>> {
      return baseMap;
    },
  };
};
