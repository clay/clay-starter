# Clay Starter

> A basic starter for Clay

## Docs
Documentation around Clay is being refined in cojunction with iteration on this starter. For beginning documentation about Clay and its data structures you can browse this link: https://claycms.gitbook.io/clay/

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
- `make add-access-key` ([Please read this doc for more information about your Clay access key](docs/clay-access-key.md))
- `make bootstrap` (This command seeds some starting data)
- `make bootstrap-user` (This command seeds a user from `sample_users.yml` file at the root of this project)

You should be able to navigate to http://localhost/_pages/sample-article.html to see an article page render!

### Accessing The Edit UI

The edit interface of Clay is a component itself called [`Kiln`](https://github.com/clay/clay-kiln)! To begin editing with the UI you'll need to make sure you've run `make boostrap-user` after replacing the sample user with your own Gmail address.

Once you're done that you can access edit mode from any page by adding `?edit=true` or by holding down `Shift` and typing `CLAY`. For example, navigating to http://localhost/_pages/sample-article.html?edit=true will grant you access to the edit interface.

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
