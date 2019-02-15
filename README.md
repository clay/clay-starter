# Clay Starter

> A basic starter for Clay

## Requirements

- [NodeJS](https://github.com/creationix/nvm)
- [Docker For Mac](https://hub.docker.com/editions/community/docker-ce-desktop-mac)
- [Clay CLI](https://github.com/clay/claycli)

## Assumptions

- This repo uses Google for OAuth by default. To use your Google account to authenticate locally change the `username` field in `sample_users.yml`
- You're running Node `8.12.0` or greater
- You've installed [Clay CLI](https://github.com/clay/claycli)

## Setup

Clone the repo and run the following commands:

- `make` (This will download the containers, run an `npm install` and start the app)
- `make bootstrap` (This command seeds some starting data)
- `make bootstrap-user` (This command seeds a user from `sample_users.yml` file at the root of this project)

You should be able to navigate to http://localhost/_pages/sample-article.html to see an article page render!

### Stopping & Clearing Out Data

- `make burn` (Stops and removes all service containers)
- `make clear-data` (Removes all local data)
- `make clear-public` (Removes the `app/public` directory which is Express' static asset directory)

## What's Running?

The project consists of four services running in Docker and Clay running on your host machine.

- NGINX: locally it allows us to forward port 80 to Clay to make working with Clay easy. The current configuration is set to only route requests to `localhost`. If you want to change the host that clay listens to you'll need to update the NGINX config
- Postgres: the primary data store for Clay data
- Redis: locally this container is the cache for Postgres, the session store for PassportJS and the event bus for Clay
- ElasticSearch: integrated for search functionality
