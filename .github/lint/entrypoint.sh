#!/bin/sh

set -e
# Change into Clay project directory
cd app;
# Only install the dev dependencies and also
# concat-stream which the stylelint module
# requires but isn't required in that project
npm install --ignore-scripts --only=dev && npm i concat-stream
# Lint the JS & CSS
npm run lint-js && npm run lint-css
