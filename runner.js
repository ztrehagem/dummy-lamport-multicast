const CLIENTS_NUM = 2;
const THRESHOLD = CLIENTS_NUM * (CLIENTS_NUM + 1);
const TYPE_REQ = 0;
const TYPE_ACK = 1;

const sp = i => ' '.repeat((i-1) * 24);

exports.Runner = class {
  constructor(id, proc = process) {
    this.id = parseInt(id);
    this.proc = proc;
    this.tick = Math.floor(Math.random() * 5) * 2 + this.id;
    this.queue = [];
    this.log(`---- ${this.id} ----`);
    this.log('startTick', this.tick);

    this.proc.on('message', e => this.recv(e));
  }

  run() {
    this.req();
  }

  log(...messages) {
    console.log(sp(this.id), ...messages);
  }

  progress(past = null) {
    if (past && past > this.tick) {
      this.log(`fixTime ${this.tick} -> ${past + this.id}`);
      this.tick = past + this.id;
    } else {
      this.log(`${this.tick} -> ${this.tick + this.id}`);
      this.tick += this.id;
    }
  }

  messageStringify(e) {
    if (e.type == TYPE_REQ)
      return `req ${e.reqId}  : ${e.tick1}.${e.tick2}`;
    else
      return `ack ${e.reqId}-${e.ackId}: ${e.tick1}.${e.tick2}`;
  }

  previewQueue() {
    for (const q of this.queue) {
      this.log(this.messageStringify(q));
    }
  }

  addQueue(e) {
    this.progress();

    if (this.queue.length) {
      let index = this.queue.findIndex(q => {
        return (q.tick1 == e.tick1 && q.tick2 > e.tick2) || q.tick1 > e.tick1;
      });
      index = index == -1 ? this.queue.length : index;
      this.queue.splice(index, 0, e);
    } else {
      this.queue.push(e);
    }
  }

  exec() {
    this.progress();
    this.log('--- exec ---');
    this.previewQueue();
    if (this.proc == process) process.exit();
  }

  recv(e) {
    if (e == 'ready') return;

    this.progress(e.tick1);
    this.log('recv', this.messageStringify(e));
    this.addQueue(e);
    if (e.type == TYPE_REQ) this.ack(e);
    if (this.queue.length >= THRESHOLD) this.exec();
  }

  req() {
    this.progress();
    this.log('req');
    this.send({
      type: TYPE_REQ,
      reqId: this.id,
      tick1: this.tick,
      tick2: this.id
    });
  }

  ack({reqId, tick1, tick2}) {
    this.progress();
    this.log('ack', reqId);
    this.send({
      type: TYPE_ACK,
      reqId,
      ackId: this.id,
      tick1: this.tick,
      tick2: this.id
    });
  }

  send(data) {
    this.progress();
    this.proc.send(data);
    this.recv(data);
  }
}
