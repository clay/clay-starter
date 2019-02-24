#!/bin/sh

set -e
# Change into Clay project directory
cd app;
# Only install the dev dependencies
npm install --only=dev
# Lint the JS & CSS
npm run lint-js && npm run lint-css
