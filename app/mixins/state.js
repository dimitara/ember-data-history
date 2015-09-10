import Ember from 'ember';

export default Ember.Mixin.create({
    modelReady: false,
    history: Ember.inject.service('history'),
    states: Ember.A([]),
    track: function(){
        this.set('states', Ember.A([]));
        this.set('modelReady', true);

        this.eachAttribute((name, meta) => {
            if(meta.options.stateless === true) return ;
            this.addObserver(name, () => {
                this.propObserver(name, meta);
            });
        });

        this.eachRelationship((name, descriptor) => {
            if(descriptor.options.stateless === true) return ;

            this.addObserver(name, () => {
                this.propObserver(name, descriptor);
            });
            
            if(descriptor.kind === 'hasMany' && Ember.isPresent(this.get(name).get('content'))){
                this.get(name).get('content').forEach(r => {
                    if(r.track) {
                        r.track();
                    }
                });
            }

            if(descriptor.kind === 'belongsTo'){
                if(this.get(name).track) {
                    this.get(name).track();
                }
            }
        });
    },

    propObserver: function(key, meta){
        var relation = this.get(key);
        var changedAttr = this.changedAttributes();
        
        if(Object.keys(changedAttr).length === 0 && !meta.kind) {
            return;
        }
        
        if(changedAttr[key]){ 
            var stackable = meta.options && meta.options.sackable;
            var historyLastModel = this.get('history.stack.lastObject');
            var state = {
                key: key, 
                type: 'attr',
                change: this.get(key),
                model: this
            };


            if (stackable && historyLastModel == this) {
                state.value = this.getPrevStateChange(key) || changedAttr[key][0],
                this.updateLastState(state);
            }else {
                state.value = this.getLastStateChange(key) || changedAttr[key][0],
                this.saveState(state);    
            }
        }

        if(meta.kind === 'hasMany'){
            var items = relation.get('content').filter(r => {
                return r.get('isNew') && !r.get('isTracked');
            });

            if(items.length > 0){
                this.saveState({
                    key: key,
                    type: 'hasMany',
                    change: items.get('firstObject'),
                    model: this
                });

                items.forEach(item => {
                    item.track();
                    item.set('isTracked', true);
                });
            }
        }

        if(meta.kind === 'belongsTo'){
            if(relation){
                this.get('history').push({
                    key: key,
                    type: 'belongsTo',
                    change: relation,
                    model: this
                });
            }
        }
    },

    removeObserver: function(key, child){
        this.get('history').push(this);

        this.saveState({
            key: key,
            type: 'remove:hasMany',
            change: child,
            model: this
        });
    },

    removeRecord: function(record){
        record.set('isRemoved', true);
        this.get(record.constructor.typeKey + 's').removeObject(record);

        this.get('states').pushObject({
            key: record.constructor.typeKey + 's',
            type: 'remove:hasMany',
            change: record,
            model: this
        });
    },

    updateLastState: function(state){
        var lastState = this.get('states.lastObject');

        if (state.change === state.value) {
            //the value will be the same if ww set it from restore
            return;
        }

        if (lastState && lastState.key === state.key && lastState.type !== 'hasMany' && lastState.type !== 'remove:hasMany') {
            lastState.change = state.change;
            lastState.value = state.value;
            return true;
        }
        this.saveState(state);
    },

    getLastStateChange: function(key){
        var state = null;
        var len = this.get('states.length');

        while(len--){
            state = this.get('states').get(len);
            if (state.key === key) {
                return state.change;
            }
        }
    },

    getPrevStateChange: function(key){
        var state = null;
        var find = false;
        var len = this.get('states.length');

        while(len--){
            state = this.get('states').get(len);
            if (state.key === key) {
                if (find == true){
                    return state.change;
                }
                find = true;
            }
        }
    },

    saveState: function(state){
        if (state.change === state.value) {
            //the value will be the same if ww set it from restore
            return;
        }
        this.get('history').push(this);
        this.get('states').pushObject(state);
        console.log('States', this.get('states'));
    },

    restore: function(states){
        var states = states || this.get('states');
        var state = states.popObject();

        if (!state) {
            return false;
        }

        if (Ember.isArray(state)) {
            while(this.restore(state)){
                //do nothing
            }
        }else {
            this.restoreFromState(state);
        }
        console.log('After Restore', states);
        return true;
    },

    restoreFromState: function(state){
        if(state.type !== 'hasMany' && state.type !== 'remove:hasMany'){
            this.set(state.key, state.value);
        }
        else{
            if(state.type === 'remove:hasMany'){
                state.change.set('isRemoved', false);
                state.change.set('isAdded', true);
                this.get(state.key).addObject(state.change);
            }
            else{
                this.get(state.key).removeObject(state.change);
            }
        }
    }
});
