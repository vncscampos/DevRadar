const axios = require('axios');

const Dev = require('../models/Dev');
const parseStringAsArray = require('../utils/parseStringAsArray');
const { findConnections, sendMessage } = require('../websocket');

module.exports = {
    async store(req, res) {
        const { github_username, techs, latitude, longitude } = req.body;

        const user = await Dev.findOne({ github_username });

        if (user) {
            return res.status(400).json({ error: 'Dev already exist.' })
        }

        const apiResponse = await axios.get(`https://api.github.com/users/${github_username}`);

        let { name, avatar_url, bio } = apiResponse.data;

        if (!name) {
            name = github_username;
        }

        const techsArray = parseStringAsArray(techs);

        const location = {
            type: 'Point',
            coordinates: [longitude, latitude],
        };

        const dev = await Dev.create({
            github_username,
            name,
            avatar_url,
            bio,
            techs: techsArray,
            location,
        });

        // Filtrar conexões que estão no maximo 10km de distancia
        // e que o novo dev tenha pelo menos uma das tecnologias

        const sendSocketMessageTo = findConnections(
            { latitude, longitude },
            techsArray,
        );

        sendMessage(sendSocketMessageTo, 'new-dev', dev);

        return res.json(dev);
    },

    async index(req, res) {
        const devs = await Dev.find();

        return res.json(devs);
    },
}