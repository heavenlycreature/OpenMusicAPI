const autoBind = require('auto-bind');

class AlbumHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this); //binding semua nilai
    }
    async postAlbumHandler(request, h) {
        this._validator.validateAlbumPayload(request.payload);
        const { name = 'untitled', year } = request.payload;
        const albumId = await this._service.addAlbum({ name, year });
        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
                albumId,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumsHandler() {
        const album = await this._service.getAlbums();
        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async getAlbumByIdHandler(request) {
        const { id } = request.params;
        const result = await this._service.getAlbumById(id);
        if (!result.rows[0].song_id) {
            const album = {
                id: result.rows[0].album_id,
                name: result.rows[0].name,
                year: result.rows[0].year,
                songs: [],
            }
            return {
                status: 'success',
                data: {
                    album,
                }
            }
        }
        const album = {
            id: result.rows[0].album_id,
            name: result.rows[0].name,
            year: result.rows[0].year,
            song: result.rows.map((songs) => ({
                id: songs.song_id,
                title: songs.title,
                performer: songs.performer,
            })),
        };

        return {
            status: 'success',
            data: {
                album,
            },
        };
    }
    async putAlbumByIdHandler(request) {
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;
        const { id } = request.params;
        await this._service.editAlbumById(id, { name, year });

        return {
            status: 'success',
            message: 'Album berhasil diperbarui',
        }
    }

    async deleteAlbumByIdHandler(request) {
        const { id } = request.params;
        await this._service.deleteAlbumById(id);
        return {
            status: 'success',
            message: 'Album dihapus',
        }
    }
}
module.exports = AlbumHandler;
