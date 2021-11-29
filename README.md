# Points BE Exercise

## Available Scripts

### Installation

Before installing, download and install [Node.js.](https://nodejs.org/en/download/) Node.js v12.0 or higher is recommended.

Navigate to the project directory and install the dependencies using [npm](https://docs.npmjs.com/cli/v8/configuring-npm/install):

```sh
npm i
```

### To start the server

To start the web service, run:

```sh
npm start
```

## API routes

### Add transactions for a specific payer and date

- `POST /transactions`

Example input:

```json
{ "payer": "DANNON", "points": 300, "timestamp": "2020-10-31T10:00:00Z" }
```

Example response:

```json
{ "message": "successfully added transaction" }
```

### Spend points

- `POST /spend`

Example input:

```json
{ "points": 200 }
```

Example response:

```json
[{ "payer": "DANNON", "points": -200 }]
```

### Return all payer point balances

- `GET /points`

Example response:

```json
{ "DANNON": 100 }
```
