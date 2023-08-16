const InvariantError = require('../../exception/invariantError');
const { collaborationPayloadSchema } = require('./schema');

const CollaborationsValidator = {
    validateCollaborationPayload: (payload) => {
        const validateResult = collaborationPayloadSchema.validate(payload);

        if (validateResult.error) {
            throw new InvariantError(validateResult.error.message);
        }
    },
};

module.exports = CollaborationsValidator;