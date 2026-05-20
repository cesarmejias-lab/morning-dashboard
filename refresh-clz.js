const { run } = require('./sync-collection');

run().catch(err => {
  console.error(err.message || err);
  process.exitCode = 1;
});
