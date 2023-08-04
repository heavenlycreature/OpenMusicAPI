const InvariantError = require('../../exception/invariantError');
const { songPayloadSchema, albumPayloadSchema } = require('./schema');

const songValidator = {
    validateSongPayload: (payload) => {
        const validationResult = songPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}

const albumValidator = {
    validateAlbumPayload: (payload) => {
        const validationResult = albumPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    }
}
module.exports = { songValidator, albumValidator };