const mongoose = require('mongoose');

const movieSchema = mongoose.Schema({
    plot : {
        type : String,
        required : true
    },
    genres : {
        type : [String],
        required : true
    },
    cast : {
        type : [String],
        required : true
    },
    title: {
        type : [String],
        required : true
    },
    year : {
        type : Number,
        required : true
    },
    type : {
        type : String,
        required : true
    },
    countries : {
        type : [String],
        required : true
    }
});

const Movie = mongoose.model("Movie",movieSchema);

module.exports = Movie;