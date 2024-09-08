const logger = require('../libs/logger');
const Movie = require('../models/movie');
const Vector = require('../models/vector');
const axios = require('axios');
const config = require('config');
const huggingFaceToken = process.env.huggingFaceToken;

async function get(req, res) {
    try{
        const movies = await Movie.find().sort({
            year: -1
        });
    
        res.status(200).json(movies);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
}

async function create(req, res) {
    try{
        const movieArray = req.body; 

        if (!Array.isArray(movieArray)) {
            return res.status(400).json({ error: "Input should be an array of movies" });
        }

        
        const movies = movieArray.map(movie => {
            const { plot, genres, cast, title, year, type, countries } = movie;

            return new Movie({
                plot: plot,
                genres: genres,
                cast: cast,
                title: title,
                year: year,
                type : type,
                countries : countries
            });
        });
    
        const savedMovies = await Movie.insertMany(movies);
    
        logger.info("Movies Created Successfully....");

        for (const movie of savedMovies) {
            try {
                const embedding = await getEmbeddings(movie.plot);
                
                if (embedding) {
                    const vector = new Vector({
                        movieId: movie._id,
                        plot_embeddings: embedding
                    });

                    await vector.save();
                } else {
                    console.error(`Failed to get embedding for movie: ${movie._id}`);
                }

            } catch (err) {
                console.error(`Error processing movie ${movie._id}:`, err.message);
            }
        }

        res.status(201).json(savedMovies);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
}

async function getEmbeddings(text) {
    try {
        const response = await axios.post(config.get('huggingFaceURL'),
            {
                inputs: text
            },
            {
                headers: {
                    'Authorization': `Bearer ${huggingFaceToken}`
                }
            }
        );

        return response.data;

    } catch (error) {
        console.error(`Error: ${error.response ? error.response.data : error.message}`);
    }
}


async function getMovies(req,res) {
    try {
        const query = req.query.query;

        const query_embeddings = await getEmbeddings(query);

        const moviesID = await Vector.aggregate([
            
            {
                $search: {
                    "knnBeta": {
                        "vector": query_embeddings,  // Query vector
                        "path": "plot_embeddings",       
                        "k": 5                 
                    }
                }
            },
            {
                $addFields: {
                    score: { $meta: "searchScore" }  // Add search score field
                }
            },
            {
                $sort: {
                    score: -1  // Sort by relevance score in descending order
                }
            }
        ]);
        
        const movieIds = moviesID.map(movie => movie.movieId);

        const movies = await Movie.find({
            _id: { $in: movieIds }
        });

        // Sort the results to match the order of movieIds
        const moviesMap = new Map(movies.map(movie => [movie._id.toString(), movie]));
        const orderedMovies = movieIds.map(id => moviesMap.get(id.toString())).filter(movie => movie !== undefined);
      
        res.status(200).json(orderedMovies);
    } catch (error) {
        console.log(`Error: ${error.response ? error.response.data : error.message}`)
        res.status(500).json({ error: error.message });
    }
    
}




module.exports.create = create;
module.exports.get = get;
module.exports.getMovies = getMovies;