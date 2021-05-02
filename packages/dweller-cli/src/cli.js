#!/usr/bin/env node

const sentry = require('./lib/sentry');
const commands = require('./commands');

const main = async () => {
  // Expand the command and options from argv
  const [, , ...args] = process.argv;
  const [command, ...options] = args;
  const { [command]: executable } = commands;

  if (command in commands)
    // Execute the command with options and handle error
    return executable(...options);

  throw new Error(`invalid command: ${command}. use ${Object.keys(commands)}`);
};

main().catch(error => sentry.exit(error));
