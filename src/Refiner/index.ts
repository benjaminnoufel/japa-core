/*
 * @japa/core
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test } from '../Test'
import { Group } from '../Group'
import { FilteringOptions } from '../Contracts'

/**
 * Exposes the API to refine unwanted tests based upon applied
 * filters.
 *
 * @example
 * const refiner = new Refiner({ tags: ['@slow'] })
 * refiner.allows('tags', ['@slow']) // true
 * refiner.allows('tags', ['@regression']) // false
 *
 * const refiner = new Refiner({ tags: [] })
 * refiner.allows('tags', ['@slow']) // true
 * refiner.allows('tags', ['@regression']) // true
 */
export class Refiner {
  /**
   * A set of pinned tests
   */
  private pinnedTests: Set<Test<any, any>> = new Set()

  /**
   * Available filters
   */
  private filters: Required<FilteringOptions> = {
    tags: [],
    tests: [],
    groups: [],
  }

  constructor(filters: FilteringOptions = {}) {
    if (filters.tags) {
      this.filters.tags = [...filters.tags]
    }

    if (filters.tests) {
      this.filters.tests = [...filters.tests]
    }

    if (filters.groups) {
      this.filters.groups = [...filters.groups]
    }
  }

  /**
   * Pin a test to be executed.
   */
  public pinTest(test: Test<any, any>): void {
    this.pinnedTests.add(test)
  }

  /**
   * Find if the group is allowed to execute its tests.
   */
  private isGroupAllowed(group: Group<any>): boolean {
    /**
     * All groups are allowed, when no filters are applied
     * on the group title
     */
    if (!this.filters.groups.length) {
      return true
    }

    return this.filters.groups.includes(group.title)
  }

  /**
   * Find if the test is allowed to be executed by checking
   * for the test title filter
   */
  private isTestTitleAllowed(test: Test<any, any>): boolean {
    /**
     * All tests are allowed, when no filters are applied
     * on the test title
     */
    if (!this.filters.tests.length) {
      return true
    }

    return this.filters.tests.includes(test.title)
  }

  /*
   * Find if the test is allowed to be executed by checking
   * for the test tags
   */
  private areTestTagsAllowed(test: Test<any, any>): boolean {
    /**
     * All tests are allowed, when no filters are applied
     * on the test tags
     */
    if (!this.filters.tags.length) {
      return true
    }

    /**
     * Find one or more matching tags
     */
    return this.filters.tags.some((tag) => test.options.tags.includes(tag))
  }

  /*
   * Find if the test is allowed to be executed by checking
   * for the pinned tests
   */
  private isAllowedByPinnedTest(test: Test<any, any>): boolean {
    /**
     * All tests are allowed, when no tests are pinned
     */
    if (!this.pinnedTests.size) {
      return true
    }

    return this.pinnedTests.has(test)
  }

  /**
   * Add a filter
   */
  public add(layer: 'tests' | 'tags' | 'groups', values: string[]): void {
    this.filters[layer].push(...values)
  }

  /**
   * Check if refiner allows a specific test or group to run by looking
   * at the applied filters
   */
  public allows(testOrGroup: Test<any, any> | Group<any>): boolean {
    if (testOrGroup instanceof Group) {
      return this.isGroupAllowed(testOrGroup)
    }

    /**
     * Layer 1
     */
    const isTestTitleAllowed = this.isTestTitleAllowed(testOrGroup)
    if (!isTestTitleAllowed) {
      return false
    }

    /**
     * Layer 2
     */
    const areTestTagsAllowed = this.areTestTagsAllowed(testOrGroup)
    if (!areTestTagsAllowed) {
      return false
    }

    /**
     * Layer 3
     */
    return this.isAllowedByPinnedTest(testOrGroup)
  }
}
