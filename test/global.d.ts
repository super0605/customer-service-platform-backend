declare namespace NodeJS {
  interface Global {
    /**
     * Available only in setup-e2e.ts/teardown-e2e.ts.
     */
    __PGCONTAINER__: {
      stop: () => Promise<void>;
    };
    /**
     * Availably only in the e2e test files.
     */
    __PGCONNSTRING__: string;
  }
}
