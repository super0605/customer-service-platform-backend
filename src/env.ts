import {
  bool,
  cleanEnv,
  makeValidator,
  port,
  Spec,
  str,
  url,
  ValidatorSpec
} from "envalid";


// #region `oneOf` definition
type MkValidator<T> = (spec?: Spec<T>) => ValidatorSpec<T>;

/**
 * Helper function to encapsulate usage of internals.
 */
function parse<T>(val: ValidatorSpec<T>, x: string): T {
  const res = val._parse(x);
  if (val.choices) {
    if (val.choices.indexOf(res) === -1) {
      throw new Error(
        `Value "${x}" not in choices: [${val.choices.join(", ")}]`
      );
    } else {
      return res;
    }
  } else {
    return res;
  }
}

const oneOf = <T>(
  val: ValidatorSpec<T>,
  ...vals: ValidatorSpec<T>[]
): MkValidator<T> => {
  const all = [val, ...vals];

  for (const v of all) {
    if (v.default !== undefined) {
      throw new Error(
        `'default' property is not supported in oneOf sub validators.`
      );
    }
    if (v.devDefault !== undefined) {
      throw new Error(
        `'devDefault' property is not supported in oneOf sub validators.`
      );
    }
    if (v.desc !== undefined) {
      throw new Error(
        `'desc' property is not supported in oneOf sub validators.`
      );
    }
    if (v.docs !== undefined) {
      throw new Error(
        `'docs' property is not supported in oneOf sub validators.`
      );
    }
    if (v.example !== undefined) {
      throw new Error(
        `'example' property is not supported in oneOf sub validators.`
      );
    }
  }

  const types = all.map(v => v.type);
  const type = `oneOf: [${types.join(", ")}]`;

  return makeValidator(x => {
    try {
      return parse(val, x);
    } catch (err) {
      const errs = [err];
      for (const v of vals) {
        try {
          return parse(v, x);
        } catch (e) {
          errs.push(e);
          continue;
        }
      }
      throw new Error(
        `oneOf validator failed: [\n${errs.map(e => e.message).join(",\n")}\n]`
      );
    }
  }, type);
};
// #endregion

const origin = oneOf(url(), str({ choices: ["*"] }));

export default cleanEnv(
  process.env,
  {
    THROW_ON_EXTRA_REQUEST_PARAMETERS: bool({
      default: false,
      devDefault: true
    }),
    THROW_ON_UNREACHABLE: bool({
      default: false,
      devDefault: true
    }),
    SUPERADMIN_PASSWORD: str({ devDefault: "dev" }),
    LOG_LEVEL: str({
      default: "info",
      choices: ["error", "warn", "info", "http", "verbose", "debug", "silly"]
    }),
    PORT: port({ devDefault: 3002 }),
    DATABASE_URL: url({
      example: ""
    }),
    EXPOSE_STACK: bool({ default: false, devDefault: true }),
    JWT_SECRET: str({ devDefault: "MYSECRET" }),
    ROOT_URL: url({
      devDefault: "http://localhost:3002",
      example: ""
    }),
    FRONTEND_ORIGIN: origin({
      devDefault: "*",
      example: ""
    }),
    EXPLICIT_TSOA_BUILD: bool({
      default: true,
      devDefault: false,
      desc:
        "If true, disables automatic tsoa generation. Use `npm run gen:tsoa` for manual generation."
    }),
    AWS_S3_REGION: str({ example: "" }),
    AWS_S3_BUCKET: str({ example: "" }),
    AWS_S3_ACCESS_KEY_ID: str(),
    AWS_S3_SECRET_ACCESS_KEY: str(),
    SENDGRID_API_KEY: str({example: ''}),
    WELCOME_EMAIL_TEMPLATE_ID: str({example: ''}),
    EMAIL_USERS_TICKET_UPDATED_ID: str({example: ''}),
    SM_NOTIFICATION_OF_NEW_TICKET_EMAIL: str({example: ''}),
  },
  // TODO: add custom reporter based on winston
  { strict: true }
);
