import Ember from 'ember';

export default Ember.Mixin.create({
    modelReady: false,
    history: Ember.inject.service('history'),
    states: Ember.A([]),
    isGroupClosed: false,
    track: function(){
        this.set('states', Ember.A([]));
        this.set('modelReady', true);
        this.set('isGroupClosed', false);

        this.eachAttribute((name, meta) => {
            if(meta.options.stateless === true || name === "isRemoved") return ;
            this.addObserver(name, () => {
                this.propObserver(name, meta);
            });
        });

        this.eachRelationship((name, descriptor) => {
            if(descriptor.options.stateless === true) return ;
            
            this.addObserver(name, () => {
                this.propObserver(name, descriptor);
            });
            
            if(descriptor.kind === 'hasMany' && Ember.isPresent(this.get(name))){
                this.get(name).forEach(r => {
                    if(r.track) {
                        r.track();
                    }
                });
            }

            /*
            //this will never execute since belongsTo is not trackable through
            if(descriptor.kind === 'belongsTo'){
                if(this.get(name).track) {
                    this.get(name).track();
                }
            }
            */
        });
    },

    propObserver: function(key, meta){
        var relation = this.get(key);
        var changedAttr = this.changedAttributes();
        
        if(Object.keys(changedAttr).length === 0 && !meta.kind) {
            return;
        }
        
        console.trace('prop change', this.get('id'), this.constructor.typeKey, key);

        if(changedAttr[key]){ 
            var groupName = meta.options && meta.options.group;
            var stackable = meta.options && meta.options.stackable;
            var historyLastModel = this.get('history.stack.lastObject');

            var state = {
                key: key, 
                type: 'attr',
                change: this.get(key),
                model: this
            };

            if ((stackable || (groupName && !this.get('isGroupClosed'))) && historyLastModel == this) {
                //if this is the current model in history update the records and get the prev one as history back value
                var prevState = this.getPrevState(key);
                if (groupName) {
                    this.updateLastGroup(state, groupName);
                }else {
                    //if we recording in this last state get the prev one as base value
                    state.value = (prevState && prevState.change) || changedAttr[key][0],
                    this.updateLastState(state);
                }
            }else {
                this.set('isGroupClosed', false);
                //if the current model in history is diffarent or property isn`t stackable or grouped add new record in stack
                var lastState = this.getLastState(key)
                if (groupName) {
                    this.saveGroup(state, groupName);
                }else {
                    //set value based on prev record
                    state.value = (lastState && lastState.change) || changedAttr[key][0],
                    this.saveState(state);    
                }
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

        this.saveState({
            key: record.constructor.typeKey + 's',
            type: 'remove:hasMany',
            change: record,
            model: this
        });

        console.trace('remove record state', this.get('states'));
    },

    addRecord: function(record){
        record.set('isRemoved', false);
        this.get(record.constructor.typeKey + 's').pushObject(record);

        this.saveState({
            key: record.constructor.typeKey + 's',
            type: 'hasMany',
            change: record,
            model: this
        });

        console.trace('add record state', this.get('states'));
    },

    updateLastGroup: function(state, groupName){
        var key = state.key;
        var prevGroup = this.getPrevState(groupName);
        var lastGroup = this.getLastState(groupName);
        var changedAttr = this.changedAttributes();
        var group = {
            key: groupName,
            type: 'group',
            model: this,
            value: {}
        };


        //if we update the group and we have already recorded group in states use it as base value
        if (prevGroup && prevGroup.type === "group" && prevGroup.key === groupName) {
            //set base values
            state.value = (prevGroup.value[key] && prevGroup.value[key].change) || changedAttr[key][0];
        }else {
            state.value = changedAttr[key][0];
        }

        //if we have recorded group just update it
        if (lastGroup && lastGroup.type === "group" && lastGroup.key === groupName){
            if (lastGroup.value[key]) {
                lastGroup.value[key].value = state.value;
                lastGroup.value[key].change = state.change;

                this.updateLastState(lastGroup);
            }else {
                lastGroup.value[key] = state;
                this.updateLastState(lastGroup);
            }
        }else {
            state.value = changedAttr[key][0];
            group.value[key] = state;
            this.saveState(group);
        }
    },

    saveGroup: function(state, groupName){
        var key = state.key;
        var lastGroup = this.getLastState(groupName);
        var changedAttr = this.changedAttributes();
        var group = {
            key: groupName,
            type: 'group',
            model: this,
            value: {}
        };


        //if we have recorded group off this type get changes as base value
        if (lastGroup && lastGroup.type === "group" && lastGroup.key === groupName) {
            state.value = (lastGroup.value[key] && lastGroup.value[key].change) || changedAttr[key][0];
            if (state.change === state.value) {
                return;
            }
            group.value[key] = state;
            this.saveState(group);
        }else {
            state.value = changedAttr[key][0];
            if (state.change === state.value) {
                return;
            }
            group.value[key] = state;
            this.saveState(group);
        }
    },

    closeGroup: function(){
        this.set('isGroupClosed', true);
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

    getLastState: function(key){
        var state = null;
        var len = this.get('states.length');

        while(len--){
            state = this.get('states').get(len);
            if (state.key === key) {
                return state;
            }
        }
    },

    getPrevState: function(key){
        var state = null;
        var find = false;
        var len = this.get('states.length');

        while(len--){
            state = this.get('states').get(len);
            if (state.key === key) {
                if (find == true){
                    return state;
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
        
        console.error('States', this.get('states'));
        console.error('History', this.get('history'));
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
        
        return true;
    },

    restoreFromState: function(state){
        console.log('restore from state');
        if(state.type !== 'hasMany' && state.type !== 'remove:hasMany'){
            if (state.type === "group") {
                if (state.value) {
                    for (var key in state.value) {
                        if (Object.prototype.hasOwnProperty.call(state.value, key)) {
                            this.set(state.value[key].key, state.value[key].value);
                        }
                    }
                }
            }else {
                this.set(state.key, state.value);
            }
        }
        else{
            if(state.type === 'remove:hasMany'){
                state.change.set('isRemoved', false);
                state.change.set('isAdded', true);
                this.get(state.key).addObject(state.change);
            }
            else{
                state.change.set('isRemoved', true);
                this.get(state.key).removeObject(state.change);
            }
        }
    }
});
