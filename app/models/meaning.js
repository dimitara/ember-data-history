import DS from 'ember-data';
import state from "../mixins/state";

var Meaning = DS.Model.extend(state, {
    text: DS.attr('string', {
        group: "order&text",
        sackable: true
    }),
    order: DS.attr('number', {
        group: "order&text",
    }),
    added: DS.attr('date', {
        stateless:true
    }),
    modified: DS.attr('date'),
    meta: DS.attr('string'),
    /*
    word: DS.belongsTo('word', {
        stateless: true
    })
    */  
});

Meaning.reopenClass({
    FIXTURES: [{
        id: "1",
        text: "cater, satisfy, run across, reach, achieve, strike",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 1
    }, {
        id: "2",
        text: "bi-weekly, biweekly",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 2
    }, {
        id: "3",
        text: "study",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 3
    }, {
        id: "4",
        text: "meditation",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 3
    }, {
        id: "5",
        text: "contamplation",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 3
    }, {
        id: "6",
        text: "severity",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 4
    }, {
        id: "7",
        text: "inclemency",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 4
    }, {
        id: "8",
        text: "recital",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 5
    }, {
        id: "9",
        text: "preparatory reading",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 5
    }, {
        id: "10",
        text: "repetition",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 5
    }, {
        id: "11",
        text: "dry run",
        added: "2015-07-11T06:08:27.897",
        modified: "2015-07-11T06:08:27.897",
        meta: null,
        word: 5
    }]
});

export default Meaning;
