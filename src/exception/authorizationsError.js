const ClientError = require('./clienError');

class AuthorizationError extends ClientError {
    constructor(message) {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}
module.exports = AuthorizationError;
