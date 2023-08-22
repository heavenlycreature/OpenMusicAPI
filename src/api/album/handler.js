const autoBind = require('auto-bind');

class AlbumHandler {
    constructor(service, validator, storageService) {
        this._service = service;
        this._validator = validator;
        this._storageService = storageService;

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
            songs: result.rows.map((songs) => ({
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

    async postLikeAlbumHandler(request, h) {
        const { id } = request.params;
        const { id: userId } = request.auth.credentials;
        await this._service.verifyUserLike(id, userId);

        await this._service.userLike(userId, id)
        const response = h.response({
            status: 'success',
            message: 'Like album berhasil ditambahkan ke daftar ',
        });
        response.code(201);
        return response;
    }

    async getLikeAlbumHandler(request, h) {
        const { id } = request.params;
        const { likes, cached } = await this._service.getLikeAlbum(id);

        const response = h.response({
            status: 'success',
            data: {
                likes,
            },
        });

        if (cached) {
            response.header('X-Data-Source', 'cache')
        }
        return response;
    }
    async deleteLikeAlbumHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.userDislike(credentialId, id);
        return {
            status: 'success',
            message: 'Berhasil membatalkan like',
        };
    }
}
module.exports = AlbumHandler;
