#!/usr/bin/env node
const program = require('commander');
const {
  create
} = require('migrate-mongo');


program
  .arguments('<name>')
  .action(run)
  .parse(process.argv);


async function run(name) {
  await create(name);
}
