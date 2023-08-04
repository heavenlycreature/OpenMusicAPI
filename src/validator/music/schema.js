const Joi = require('joi');

const songPayloadSchema = Joi.object({
    title: Joi.string().required(),
    year: Joi.number().required(),
    genre: Joi.string().required(),
    duration: Joi.number(),
    albumId: Joi.string(),
})

const albumPayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
})
module.exports = { songPayloadSchema, albumPayloadSchema }
