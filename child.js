const {Runner} = require('./runner');

const id = process.argv[2];
// console.log('child:', id);

const runner = new Runner(id);
process.send('ready');

runner.run();
