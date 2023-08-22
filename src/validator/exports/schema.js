const Joi = require('joi');

const exportsPlaylistPayloadSchema = Joi.object({
    targetEmail: Joi.string().email({ tlds: true }).required(),
})
module.exports = exportsPlaylistPayloadSchema;
