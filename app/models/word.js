import DS from 'ember-data';
import state from "../mixins/state";

var Word = DS.Model.extend(state, {
    word: DS.attr('string'),
    added: DS.attr('date', {
        stateless:true
    }),
    modified: DS.attr('date'),
    meta: DS.attr('string'),

    meanings: DS.hasMany('meaning', {
        async:true
    }),
    lists:  DS.hasMany('list'),
});


Word.reopenClass({
    FIXTURES: [{
        id: "1",
        word: "attain",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        meanings: ["1"]
    }, {
        id: "2",
        word: "fortnightly",
        added: "2015-06-09T06:08:27.897",
        modified: "2015-06-09T06:08:27.897",
        meta: null,
        meanings: ["2"]
    }, {
        id: "3",
        word: "musing",
        added: "2015-06-09T06:08:27.897",
        modified: "2015-06-09T06:08:27.897",
        meta: null,
        meanings: ["3", "4", "5"]
    }, {
        id: "4",
        word: "austerity",
        added: "2015-06-09T06:08:27.897",
        modified: "2015-06-09T06:08:27.897",
        meta: null,
        meanings: ["6", "7"]
    }, {
        id: "5",
        word: "rehearsal",
        added: "2015-06-09T06:08:27.897",
        modified: "2015-06-09T06:08:27.897",
        meta: null,
        meanings: ["8", "9", "10", "11"]
    }]
});

export default Word;