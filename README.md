# MAL Chord 📈

[MAL Chord](https://www.mal-chord.com/) is an interactive web-app that allows users to visualise their [MyAnimeList](https://myanimelist.net/) library. The application has been built as a single-page [Preact](https://preactjs.com/) project which communicates with a [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/) middleware service.

This repository is responsible for managing all of the Node.js (middleware) code.

## Running locally

### Initial Setup

To run the project locally, you will need to obtain your own client credentials through MyAnimeList (see Step 0 of [this](https://myanimelist.net/blog.php?eid=835707) blog post for a guide on how to do this). During this process, you will be prompted to enter app information - the below values can be used:
| Field | Value |
|---|---|
| App Redirect URL | `http://localhost:8080` |
| Homepage URL | `http://localhost:8080` |
| App Logo URL | `http://localhost:3030/chord-logo` |

While this service can be used on its own, the logic to authenticate with the MyAnimeList API and obtain a user token (required for all requests to the API) has been built into the [MAL Chord UI](https://github.com/Johoseph/mal-chord) project - so it is highly recommended to use this as an entrypoint.

### Install and Configure

Once you have cloned the repository you will need to install the associated dependencies the project uses:

```
npm install
```

The following commands can be run in the project:

- `npm start` - Runs the application in development mode
- `npm run watch` - Utilises nodemon to runs the application in watch mode

Environment configuration can be specified by adding a `.env` file to the root of your local repository. A list of the variables needed for local development has been included below.
| Key | Value | Purpose |
| --- | --- | --- |
| `PORT` | 3030 | Specifies the port that the middleware will run on |
|`CLIENT_ID` | Your MAL API Client ID | Required for all requests to the MyAnimeList API |
|`CLIENT_SECRET` |Your MAL API Client Secret| Used to obtain a MyAnimeList access token |
