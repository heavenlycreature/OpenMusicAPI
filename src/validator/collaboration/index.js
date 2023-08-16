const InvariantError = require('../../exception/invariantError');
const { collaborationPayloadSchema, deleteCollaborationPayloadSchema } = require('./schema');

const CollaborationsValidator = {
    validatePostCollaborationPayload: (payload) => {
        const validateResult = collaborationPayloadSchema.validate(payload);

        if (validateResult.error) {
            throw new InvariantError(validateResult.error.message);
        }
    },
    validateDeleteCollaborationPayload: (payload) => {
        const validationResult = deleteCollaborationPayloadSchema.validate(payload)
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message)
        }
    }
};

module.exports = CollaborationsValidator;