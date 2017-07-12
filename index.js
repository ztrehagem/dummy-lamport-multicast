const {fork} = require('child_process');
const {Runner} = require('./runner');

const id = 1;
// console.log('parent:', id);


// POSIXのforkのようにクローンはしません．child.jsを別プロセスで立ち上げて双方向通信可能にします
const child = fork('./child', [id + 1]);
const runner = new Runner(id, child);

child.once('message', msg => {
  runner.run();
});
