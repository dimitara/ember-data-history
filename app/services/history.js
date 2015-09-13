import Ember from 'ember';

var {computed, A} = Ember;

export default Ember.Service.extend({
    stack: A([]),
    init: function(model){
        this.clearAll();
        if(model) {
            model.track();
        }
    },
    isEmpty: computed('stack,stack.length', function(){
        return this.get('stack.length') === 0;
    }),
    clearAll: function(){
        this.set('stack', A([]));
    },
    push: function(model){
        console.log('push stack', model);
        this.get('stack').pushObject(model);
    },
    undoAll: function(){
        if (this.get('isEmpty')) {
            return;
        }
        while(this.undo()){
        }
    },
    undo: function(record){
        var model = this.get('stack').popObject();
        console.log('model', model);
        if(model) {
            model.restore();
            return true;
        }
        return false;
    }
});
