import DS from 'ember-data';
import state from "../mixins/state";

var Vocabulary = DS.Model.extend(state, {
    langFrom: DS.attr('string'),
    langTo: DS.attr('string'),
    words: DS.hasMany('word')
});

Vocabulary.reopenClass({
    FIXTURES: [{
        id: "1",
        langFrom: "en",
        langTo: "en",
        words: ["1", "2", "3", "4", "5"]
    }]
});

export default Vocabulary;
