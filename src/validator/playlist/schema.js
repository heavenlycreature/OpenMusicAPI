const Joi = require('joi');

const playlistPayloadSchema = Joi.object({
    name: Joi.string().required(),
});

const addSongPayloadSchema = Joi.object({
    playlistId: Joi.string().required(),
    songId: Joi.string().required(),
});

module.exports = {
    playlistPayloadSchema,
    addSongPayloadSchema,
};