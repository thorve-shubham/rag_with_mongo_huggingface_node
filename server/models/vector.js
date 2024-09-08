const mongoose = require('mongoose');

const vecotSchema = mongoose.Schema({
    movieId : {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'My Movie'
    },
    plot_embeddings : {
        type : [Number],
        required : true
    }
});

const Vector = mongoose.model("Vector",vecotSchema);

module.exports = Vector;