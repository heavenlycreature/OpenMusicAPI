const InvariantError = require('../../exception/invariantError');
const { usersPayloadSchema } = require('./schema');

const UsersValidator = {
    validateUsersPayload: (payload) => {
        const validationResult = usersPayloadSchema.validate(payload);
        if (validationResult.error) {
            throw new InvariantError(validationResult.error.message);
        }
    },
}
module.exports = { UsersValidator };