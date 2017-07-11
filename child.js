const {run} = require('./runner');

const id = process.argv[2];
// console.log('child:', id);

const runner = run(id);
process.send('ready');

runner();
