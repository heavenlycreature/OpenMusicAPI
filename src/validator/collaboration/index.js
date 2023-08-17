const InvariantError = require('../../exception/invariantError');
const { CollaborationPayloadSchema } = require('./schema');

const CollaborationsValidator = {
    validateCollaborationPayload: (payload) => {
        const validateResult = CollaborationPayloadSchema.validate(payload);

        if (validateResult.error) {
            throw new InvariantError(validateResult.error.message);
        }
    }
};

module.exports = CollaborationsValidator;