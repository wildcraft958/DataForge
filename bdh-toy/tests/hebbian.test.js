import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import HebbianMemory from '../hebbian.js';

describe('HebbianMemory', () => {
  it('fresh memory reads zero for any query', () => {
    const mem = new HebbianMemory(4);
    const x = [1, 0, 1, 0];
    const out = mem.read(x);
    assert.equal(out.length, 4);
    for (const val of out) {
      assert.equal(val, 0);
    }
  });

  it('after one write, read with same key recovers the value', () => {
    const mem = new HebbianMemory(4);
    const key = [1, 0, 0, 0];
    const val = [0, 0, 1, 0];
    mem.write(key, val);

    const out = mem.read(key);
    // x = [1,0,0,0], sigma after write: sigma[0][2] = 1, rest 0
    // read: o[j] = sum_i(x[i] * sigma[i][j]) = sigma[0][j]
    // so o = [0, 0, 1, 0], then ReLU keeps it
    assert.deepEqual(out, [0, 0, 1, 0]);
  });

  it('reset returns sigma to zero', () => {
    const mem = new HebbianMemory(4);
    mem.write([1, 1, 0, 0], [0, 0, 1, 1]);
    assert.ok(mem.energy() > 0);

    mem.reset();
    assert.equal(mem.energy(), 0);

    const out = mem.read([1, 1, 0, 0]);
    for (const val of out) {
      assert.equal(val, 0);
    }
  });

  it('energy increases after write', () => {
    const mem = new HebbianMemory(4);
    const before = mem.energy();
    mem.write([1, 0, 0, 0], [0, 1, 0, 0]);
    const after = mem.energy();
    assert.ok(after > before, `energy should increase: ${before} -> ${after}`);
  });

  it('multiple writes accumulate (interference)', () => {
    const mem = new HebbianMemory(4);

    mem.write([1, 0, 0, 0], [0, 1, 0, 0]);
    const energyAfterOne = mem.energy();

    mem.write([0, 1, 0, 0], [0, 0, 1, 0]);
    const energyAfterTwo = mem.energy();

    assert.ok(
      energyAfterTwo > energyAfterOne,
      `energy after 2 writes (${energyAfterTwo}) should exceed energy after 1 (${energyAfterOne})`
    );
  });
});
