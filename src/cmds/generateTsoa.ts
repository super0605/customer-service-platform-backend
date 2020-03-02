import generateTsoa from "../generateTsoa";

(async (): Promise<void> => {
  await generateTsoa({ force: true });
})();
