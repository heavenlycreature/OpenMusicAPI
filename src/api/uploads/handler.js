const autoBind = require('auto-bind');


class UploadsHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postUploadImageHandler(request, h) {
        const { cover } = request.payload;
        const { id: albumId } = request.params;
        this._validator.validateImageHeaders(cover.hapi.headers);

        const filename = await this._service.writeFile(cover, cover.hapi);
        const path = `http://${process.env.HOST}:${process.env.PORT}/uploads/images/${filename}`;

        await this._service.addAlbumCover(path, albumId);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }
}
module.exports = UploadsHandler;