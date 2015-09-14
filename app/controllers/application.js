import Ember from 'ember';

export default Ember.Controller.extend({
    history: Ember.inject.service('history'),
    words: null,
    init: function(){
        this.store.find('word').then(words => {
            this.set('words', this.get('model').get('words'));
            this.get('history').init(this.get('model'));
            this.send('select', words.get('firstObject'));
        });
    },
    actions: {
        select: function(word){
            this.get('words').setEach('isSelected', false);
            this.set('selectedWord', word);
            this.set('selectedMeaningWord', word.get('id'));
            if(word){
                word.set('isSelected', true);
            }
        },
        addMeaning: function(){
            this.store.createRecord('meaning', {
                id: null,
                text: '',
                word: this.get('selectedWord'),
                isEditMode: true
            });
        },
        editMeaning: function(meaning){
            this.set('selectedMeaningWord', this.get('selectedWord.id'));

            meaning.set('isEditMode', true);
        },
        deleteMeaning: function(meaning){
            this.get('selectedWord').removeRecord(meaning);
        },
        editWord: function(){
            this.get('selectedWord').set('isEditMode', true);
        },
        deleteWord: function(){
            
        },
        saveWord: function(){
            this.get('selectedWord').set('isEditMode', false);
        },
        cancelWord: function(){
            //TODO: revert
            this.get('selectedWord').set('isEditMode', false);
        },
        saveMeaning: function(meaning){
            if(this.get('selectedMeaningWord') !== meaning.get('word.id')){
                //if you want to reuse the current object
                this.send('deleteMeaning', meaning);
                var word = this.get('words').filterBy('id', this.get('selectedMeaningWord')).get('firstObject');
                //meaning.set('word', word);
                word.addRecord(meaning);
                
                /*
                //if you want to remove the whole meaning and create a new one
                var newMeaning = this.store.createRecord('meaning', {
                    id: null,
                    text: meaning.get('text'),
                    word: word,
                    isEditMode: false
                });

                word.get('meanings').pushObject(newMeaning);
                */
            }
            
            meaning.set('isEditMode', false);
            this.set('selectedMeaningWord', this.get('selectedWord.id'));
        },
        cancelMeaning: function(meaning){
            this.get('history').undo(meaning);
            
            meaning.set('isEditMode', false);
        },
        undo: function(){
            this.get('history').undo();
        },
        cancelSubmit: function(){
            this.get('history').undoAll();
            this.send('select', null);
        },
        submitWord: function(){
            this.send('select', null);
        }
    }
});
