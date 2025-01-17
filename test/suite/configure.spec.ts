/*
 * @japa/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import { Test } from '../../src/Test'
import { Group } from '../../src/Group'
import { Suite } from '../../src/Suite'
import { Refiner } from '../../src/Refiner'
import { Emitter } from '../../src/Emitter'
import { TestContext } from '../../src/TestContext'

test.group('configure', () => {
  test('create an instance of suite', async (assert) => {
    const suite = new Suite('sample suite', new Emitter())
    assert.instanceOf(suite, Suite)
    assert.equal(suite.name, 'sample suite')
  })

  test('add tests to suite', async (assert) => {
    const emitter = new Emitter()
    const refiner = new Refiner({})

    const suite = new Suite('sample suite', new Emitter())
    const testInstance = new Test('2 + 2 = 4', new TestContext(), emitter, refiner)
    suite.add(testInstance)

    assert.deepEqual(suite.stack, [testInstance])
  })

  test('add group to suite', async (assert) => {
    const emitter = new Emitter()
    const refiner = new Refiner({})

    const suite = new Suite('sample suite', new Emitter())
    const group = new Group('sample group', emitter, refiner)
    const testInstance = new Test('2 + 2 = 4', new TestContext(), emitter, refiner)

    group.add(testInstance)
    suite.add(group)

    assert.deepEqual(suite.stack, [group])
  })

  test('tap into tests to configure them', async (assert) => {
    const emitter = new Emitter()
    const refiner = new Refiner({})

    const suite = new Suite('sample suite', new Emitter())
    const testInstance = new Test('2 + 2 = 4', new TestContext(), emitter, refiner)

    suite.onTest((t) => t.disableTimeout())
    suite.add(testInstance)

    assert.equal(testInstance.options.timeout, 0)
  })

  test('tap into group to configure them', async (assert) => {
    const emitter = new Emitter()
    const refiner = new Refiner({})

    const suite = new Suite('sample suite', new Emitter())
    const group = new Group('sample group', emitter, refiner)
    const testInstance = new Test('2 + 2 = 4', new TestContext(), emitter, refiner)

    suite.onGroup((g) => g.each.timeout(0))

    suite.add(group)
    group.add(testInstance)

    assert.equal(testInstance.options.timeout, 0)
  })
})
