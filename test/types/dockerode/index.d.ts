declare module "dockerode" {
  class Dockerode {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
  namespace Dockerode {
    export class Container {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
  }
  export default Dockerode;
}
