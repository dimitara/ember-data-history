import Ember from 'ember';

export default Ember.Mixin.create({
    modelReady: false,
    history: Ember.inject.service('history'),
    track: function(){
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
            this.get('history').push({
                key: key, 
                type: 'attr',
                change: this.get(key),
                value: changedAttr[key][0],
                model: this
            });    
        }

        if(meta.kind === 'hasMany'){
            var items = relation.get('content').filter(r => {
                return r.get('isNew') && !r.get('isTracked');
            });

            if(items.length > 0){
                this.get('history').push({
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
        this.get('history').push({
            key: key,
            type: 'remove:hasMany',
            change: child,
            model: this
        });
    },

    removeRecord: function(record){
        record.set('isRemoved', true);
        this.get(record.constructor.typeKey + 's').removeObject(record);

        this.get('history').push({
            key: record.constructor.typeKey + 's',
            type: 'remove:hasMany',
            change: record,
            model: this
        });
    },

    restore: function(state){
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
