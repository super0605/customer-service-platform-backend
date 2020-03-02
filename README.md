# Customer Service Platform
# Configuration

Following environment variables are in use (check `src/env.ts` and `.env.example`):

- **required** `DATABASE_URL` - connection string for database
- **required** `AWS_S3_*` - aws s3 credentials and bucket info. Check `.env.example`.
- **production required** `JWT_SECRET` - secret string for jwt token generation
- **production required** `ROOT_URL` - root url for the api, "http://localhost:3002"
- **production required** `PORT` - port for webserver to listen at (development default 3002)
- **production required** `SUPERADMIN_PASSWORD` - password for a superadmin user (his login is `superadmin@superadmin.com`)
- **production required** `FRONTEND_ORIGIN` - used for specifying cors origin
- `EXPOSE_STACK` - if `true`, expose stack on the api error responses. By default it is `true` for `NODE_ENV=development` or empty `NODE_ENV`, and `false` for `NODE_ENV=production`.
- `LOG_LEVEL` - check `winston` documentation for available log levels. By default it is `info`.
- `THROW_ON_EXTRA_REQUEST_PARAMETERS` - if true, throw exception when extra parameters are passed in the api request, otherwise just silently ignore them.
- `THROW_ON_UNREACHABLE` - if true, throw exception when exhaustive checks are not exhaustive enough in runtime.
- `EXPLICIT_TSOA_BUILD` - If true, disables automatic tsoa generation. Use `npm run gen:tsoa` for manual generation.

Copy `.env.example` to `.env` and modify as needed.

# Build (production)

```sh
npm run build
```

It cleans `build` directory and outputs all generated and dist files there. Build happens in several
stages:

- Firstly `tsoa` generates OpenApi v3 specification and code for `express` routes definition (`build/routes.ts` and `build/swagger.json`)
- Then typescript sources are compiled into javascript and result is output at `build/dist`
- Then migration sql files are copied to the `build/dist/migrations`

After build, `build/dist` directory is self-contained (everything needed to run the app) except for `node_modules` - external
dependencies are not bundled.

# Start (production)

Do `Build (production)` section before starting.

```sh
npm run start
```

Starts webserver listening at `PORT` environment variable (or `3002` by default).

- `/docs` - api docs endpoint (http://localhost:3002/docs)
- `/v1` - base api url

# Build/Start (development)

```sh
npm run start:dev
```

Starts webserver listening at `PORT` environment variable (or `3002` by default).

- `/docs` - api docs endpoint (http://localhost:3002/docs)
- `/v1` - base api url

For development mode, the build happens on-the-fly using `ts-node`. This project uses `tsoa` which generates
routes file from controllers definitions. Such generation happens automatically at the start of app and
result is placed ta `build/routes.ts` file. This file is included by the express app `src/app.ts`.

`npm run gen:tsoa` generates `build/routes.ts` and `build/swagger.json` manually in case automatic generation fails for some reason.

# Migrations

Migrations are done automatically at the start of the project using `umzug`
to handle migration state (which migrations were applied). It uses `SequelizeMeta`
table in the db to keep track of that.

It scans the `<rootDir>\migrations` directory for `.sql` files (other extensions are ignored)
and executes these queries one-by-one in alphabetical order.

**Important:** Once you add a `.sql` there, **DO NOT** change it's content. Changing a migration won't
trigger a rerun of that migration. Instead, add a _new_ migration that applies a fix.

# Seeds

After migrations are applied, the db is initialized with seeds. Take a look at `src/seeds/seeds.ts` for
a list of seeds to apply.

# Test

Integration tests should be named `sut.e2e.ts` and unit tests should be named `sut.test.ts`.

Integration tests are run with all migrations applied from scratch.

For integration tests it uses `testcontainers` to start up Docker containers for dependencies like postgres.
So make sure Docker is installed and works correctly:

```sh
docker info
```

To run tests:

```sh
npm run test
```

Or with additional information from `testcontainers` (use it if you are not sure your Docker works correctly):

```sh
DEBUG=testcontainers npm run test
```

You can control which test configuration is run using `TEST_SUITE` env variable. Check `jest.config.js` for possible values.

Use `TEST_COMPILED` env variable to control whether jest runs source test ts files or compiled test files.

# Contribution

Please check `Tools` section.
Please don't forget to `npm run prepush` before pushing. It runs some checks and tests.

## Debug

```sh
npm run start:dev
```

### VSCode

Select "Launch via NPM" debug configuration.

## Tools

Please install extensions to support following tools in your editor:

### EditorConfig

https://editorconfig.org/

### ESLint

https://eslint.org/

### Prettier

https://prettier.io/
