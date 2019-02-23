# Clay Access Key

By default Clay authenticates non-GET requests to the API using an access token. This token is set by an environment variable in your local instance is required any time you try to write imformation.

## Setting Access Key

To set an access key for your instance simply define the `CLAY_ACCESS_KEY` environment variable in your instance. When Amphora starts up it will read this value for any future requests.

In this starter project [the value of the access key is defined here](https://github.com/clay/clay-starter/blob/master/app/.env#L5).

## Making HTTP Requests To Clay

Whenever you make a request to a Clay endpoint make sure you add the following header to your requests:

`Authorization: token <CLAY_ACCESS_KEY>`

## Clay CLI Import Command

[Clay CLI's `import` command](https://github.com/clay/claycli#import) makes it easy to write starter data to Clay or move data between environments. This command requires you pass in the access token as part of the command or to pass in an alias to the key which is stored in your local `~/.clayconfig` file. [You can create aliases for keys with these instructions](https://github.com/clay/claycli#config).

This project provides a Make command to run the configure step and set it to the default access key value declared in the `app/.env` file: `make add-access-key`. Be sure to run this command so that your local environment has the access key setup so you can use Clay CLI to make your workflow easier.
