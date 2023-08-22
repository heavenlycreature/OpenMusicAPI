const autoBind = require('auto-bind');

class ExportsHandler {
    constructor(service, validator, playlistsService) {
        this._service = service;
        this._validator = validator;
        this._playlistsService = playlistsService;

        autoBind(this);
    }
    async postExportsPlaylistHandler(request, h) {
        this._validator.validateExportsPlaylistPayload(request.payload);

        const { id: userId } = request.auth.credentials;
        const { playlistId } = request.params;
        const { targetEmail } = request.payload;

        await this._playlistsService.verifyAccessUser(userId, playlistId);

        const message = {
            playlistId,
            targetEmail,
        }
        await this._service.sendMessage('exports:playlist', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang di proses',
        })
        response.code(201);
        return response;
    }
}
module.exports = ExportsHandler;
