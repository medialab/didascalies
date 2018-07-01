
const TSNE = require('tsne-js');

const statsVals = ['attaques_recues', 'invectivite', 'soutiens_recus', 'mots_prononces'];


const updateTsneValues = nextProps => {
  console.info('starting to update tsne values');
  const {
    data,
  } = nextProps;
  let model = new TSNE({
    dim: 2,
    perplexity: 30.0,
    earlyExaggeration: 1.0, // 1.0,// 4.0,
    learningRate: 100.0,
    nIter: 1000, // 500, //200,// 1000,
    metric: 'euclidean'
  });

  console.info('initing model', data.length);

  console.info('tsne update, estimated time %s ms', Math.pow(data.length, 2) * .15);
  // inputData is a nested array which can be converted into an ndarray
  // alternatively, it can be an array of coordinates (second argument should be specified as 'sparse')
  model.init({
    data,
    type: 'dense'
  });

  console.info('running model');

  // `error`,  `iter`: final error and iteration number
  // note: computation-heavy action happens here
  let [error, iter] = model.run();

  // `output` is unpacked ndarray (regular nested javascript array)
  // let output = model.getOutput();

  console.info('tsne: values updated');
  // `outputScaled` is `output` scaled to a range of [-1, 1]
  return model.getOutputScaled();
}

onmessage = function(e) {
  console.info('TSNE worker: Message reçu du script principal');
  console.time('tsne update');
  var workerResult = updateTsneValues(e.data);
  console.timeEnd('tsne update');
  console.info('TSNE worker: Renvoi d\'un message au script principal');
  postMessage(workerResult);
} 