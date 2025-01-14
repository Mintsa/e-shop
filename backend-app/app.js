//const { configDotenv, config } = require("dotenv");
const express = require("express");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const cors = require('cors');
const categoryRouter = require('./Routers/categoryRoute');
const productRoute = require('./Routers/productRoute');
const userRouter = require('./Routers/userRoute');
const orderRoute = require('./Routers/orderRoute');
const authJwt = require('./helpers/jwt');
const errorhandler = require('./helpers/errorHandler');


const app = express();
//require('configDotenv/config');
dotenv.config();

const api = process.env.API_URL;
//Midleware
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads',express.static(__dirname + '/public/uploads'));
//app.use(errorhandler());

app.use(cors());
app.options('*', cors());


mongoose.connect(process.env.MONGO_DB_URL)
.then( () => {
   console.log("DataBase connected");})
.catch(err => console.log(err));

app.use(`${api}`,productRoute);
app.use(`${api}`, categoryRouter);
app.use(`${api}`, userRouter);
app.use(`${api}`, orderRoute);

app.listen("3000", () => {
    console.log("The server is running :http://localhost:3000");
})