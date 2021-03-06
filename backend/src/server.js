const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');
require('dotenv').config();

const routes = require('./routes')

const app = express();
const server = http.Server(app);

setupWebSocket(server);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(routes);


server.listen(3333);