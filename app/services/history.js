import Ember from 'ember';

var {computed} = Ember;

export default Ember.Service.extend({
    stack: Ember.A([]),
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
        this.set('stack', Ember.A([]));
    },
    push: function(object){
        var stack = this.get('stack');

        if(!stack[stack.length - 1]){ 
            stack.pushObject(object);

            console.log('Undo Stack', stack);
            return ;
        }

        var lastItem = stack[stack.length - 1];
        if(lastItem.model === object.model && lastItem.key === object.key && lastItem.type !== 'hasMany' && lastItem.type !== 'remove:hasMany'){
            lastItem.value = object.value;
        }
        else{
            stack.pushObject(object);
        }

        console.log('Undo Stack', stack);
    },
    undoAll: function(){
        if (this.get('isEmpty')) {
            return;
        }
        while(this.undo()){
        }
    },
    undo: function(){
        var stack = this.get('stack');

        var lastObjectState = stack.get('lastObject');
        
        if(!lastObjectState) {
            return false;
        }

        lastObjectState.model.restore(lastObjectState);
        stack.removeObject(lastObjectState);

        return true;
    }
});
