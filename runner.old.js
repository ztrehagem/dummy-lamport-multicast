const THRESHOLD = 6;
const TYPE_REQ = 0;
const TYPE_ACK = 1;

const sp = i => ' '.repeat((i-1) * 24);

exports.run = (id, proc = process)=> {
  id = parseInt(id);
  console.log(sp(id), `---- ${id} ----`);
  let tick = Math.floor(Math.random() * 5) * 2 + id;
  console.log(sp(id), 'starttick', tick);
  const queue = [];

  const progress = past => {
    if (past && past > tick) {
      console.log(sp(id), `fixtime ${tick} -> ${past+id}`);
      tick = past + id;
    } else {
      console.log(sp(id), `${tick} -> ${tick+id}`);
      tick += id;
    }
  };

  const msgStringify = e => {
    if (e.type == TYPE_REQ)
      return `req ${e.reqId}  : ${e.tick1}.${e.tick2}`;
    else
      return `ack ${e.reqId}-${e.ackId}: ${e.tick1}.${e.tick2}`;
  }

  const previewQueue = ()=> {
    // console.log(sp(id), 'queue -----');
    queue.forEach(e => console.log(sp(id), msgStringify(e)));
  }

  const addQueue = msg => {
    // console.log(sp(id), 'addqueue', msg);
    progress();

    if (queue.length) {
      let index = queue.findIndex(e => (e.tick1 == msg.tick1 && e.tick2 > msg.tick2) || e.tick1 > msg.tick1)
      queue.splice(index == -1 ? queue.length : index, 0, msg);
    } else {
      queue.push(msg);
    }
    // previewQueue();
  }

  const exec = ()=> {
    progress();
    console.log(sp(id), '--- exec ---');
    previewQueue();
  }

  const recv = msg => {
    if (msg == 'ready') return;

    progress(msg.tick1);
    console.log(sp(id), 'recv', msgStringify(msg));

    addQueue(msg);

    if (msg.type == TYPE_REQ) {
      ack(msg);
    }

    if (queue.length >= THRESHOLD) {
      exec();
      proc == process && process.exit();
    }
  };

  const req = ()=> {
    progress();
    console.log(sp(id), 'req');
    const r = {
      type: TYPE_REQ,
      reqId: id,
      tick1: tick,
      tick2: id
    };
    send(r);
    sendSelf(r);
  };

  const ack = ({reqId, tick1, tick2})=> {
    progress();
    console.log(sp(id), 'ack', reqId);
    const a = {
      type: TYPE_ACK,
      reqId,
      ackId: id,
      tick1: tick,
      tick2: id
    };
    send(a);
    sendSelf(a);
  }

  const send = data => {
    progress();
    proc.send(data);
  };

  const sendSelf = data => {
    progress();
    recv(data);
  }

  proc.on('message', recv);
  return ()=> req();
};
