const InvariantError = require('../../exception/invariantError');
const { playlistPayloadSchema, addSongPayloadSchema } = require('./schema');

const PlaylistValidator = {
    validatePlaylistPayload: (payload) => {
        const validationResult = playlistPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

    validateSongPayload: (payload) => {
        const validationResult = addSongPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
};

module.exports = PlaylistValidator;