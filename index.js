const {fork} = require('child_process');
const {run} = require('./runner');

const id = 1;
// console.log('parent:', id);


// POSIXのforkのようにクローンはしません．child.jsを別プロセスで立ち上げて双方向通信可能にします
const child = fork('./child', [id + 1]);
const runner = run(id, child);

child.once('message', msg => {
  runner();
});
