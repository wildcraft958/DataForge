import type { Model } from './types';
import config from './model-config.json';
import vocab from './vocab.json';
import weights from './weights.json';

// Bundled rather than fetched: the demo must survive a dead network, and a
// runtime 404 here would surface as an error screen mid-presentation.
export function loadModel(): Model {
  if (weights.embeddings.length !== vocab.length || weights.embeddings[0].length !== config.dModel) {
    throw new Error('Model asset shapes do not match configuration.');
  }
  return { config, vocab, ...weights } as unknown as Model;
}
