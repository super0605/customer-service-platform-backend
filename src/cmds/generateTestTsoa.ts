import generateTsoa from "../generateTsoa";
import { tsoaBuildDir, iocModulePath } from "test/helpers";

(async (): Promise<void> => {
  await generateTsoa({
    force: true,
    output: tsoaBuildDir,
    iocModule: iocModulePath
  });
})();
