import Ember from 'ember';
import StateMixin from '../../../mixins/state';
import { module, test } from 'qunit';

module('Unit | Mixin | state');

// Replace this with your real tests.
test('it works', function(assert) {
  var StateObject = Ember.Object.extend(StateMixin);
  var subject = StateObject.create();
  assert.ok(subject);
});
