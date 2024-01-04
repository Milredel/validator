<p align="center">
  ValidatoR
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.
[Mongodb](https://mongoosejs.com/docs/guide.html) ORM

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test
```

## Usage

You need to send a POST request to http://localhost:3000/movements/validation or http://127.0.0.1:3000/movements/validation with a JSON payload in body.
See test/payload-ok.json or test/payload-ko.json for examples.

One thing I did not manage is performance with huge payload. Payload upper limit is really high in POST requests, but if we need more, we would have to implement a solution with a file upload and then reading file line after line (without loading everything in memory, that is). Main function AppService.checkForErrors() would have to be adapted though.

## License

  Nest is [MIT licensed](LICENSE).
