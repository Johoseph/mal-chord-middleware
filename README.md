# MAL Chord 📈

MAL Chord is an interactive web-app that allows users to visualise their [MyAnimeList](https://myanimelist.net/) library. 

![image](https://user-images.githubusercontent.com/49534136/185727853-aba00599-fa1c-4fc6-9b8f-834f64f5e131.png)

The application has been built as a single-page [Preact](https://preactjs.com/) project which communicates with a [Node.js](https://nodejs.org/en/), [Express](https://expressjs.com/) middleware service.

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
- `npm run watch` - Utilises [nodemon](https://nodemon.io/) to run the application in watch mode

Environment configuration can be specified by adding a `.env` file to the root of your local repository. A list of the variables needed for local development has been included below.
| Key | Value | Purpose |
| --- | --- | --- |
| `PORT` | 3030 | Specifies the port that the middleware will run on |
|`CLIENT_ID` | Your MAL API Client ID | Required for all requests to the MyAnimeList API |
|`CLIENT_SECRET` |Your MAL API Client Secret| Used to obtain a MyAnimeList access token |

## What happened to `mal-chord.com`?
This site was originally deployed via Amazon services at [mal-chord.com](https://mal-chord.com/), however has been retired as of 20/08/2022 due to my free-tier of the Amazon services expiring. See below for an overview of the services that I utilised to get this running:

- Amplify for Preact client
- Elastic Beanstalk for Node.JS server
- Route 53 to allow server to be accessed via `api.mal-chord` URL prefix
