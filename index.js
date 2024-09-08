require('dotenv').config();
const config = require('config');
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const logger = require('./server/libs/logger');

const mongodbUrl = process.env.mongodbUrl;


//importing routes
const movie = require('./server/routes/movies');

//loading express
const app = express();

//setting up middlewares
app.use(express.json());

//routes
app.use('/movie',movie);


const server = http.createServer(app);

//start Server
server.listen(config.get('Port'),()=>{
    logger.info("Express server started on port "+config.get('Port'));
});

//DB Connect
mongoose.connect(mongodbUrl)
.then(()=>{
    logger.info("Connected To MongoDB");
})
.catch((error)=>{
    logger.error("Something went Wrong : "+error);  
});