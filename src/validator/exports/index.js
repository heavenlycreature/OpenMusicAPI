const exportsPlaylistPayloadSchema = require('./schema');
const InvariantError = require('../../exception/invariantError');

const ExportsValidator = {
    validateExportsPlaylistPayload: (payload) => {
        const validationResult = exportsPlaylistPayloadSchema.validate(payload);

        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },

};

module.exports = ExportsValidator;