const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(songService, playlistsService, validator) {
        this._songService = songService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({
            name,
            owner: credentialId,
        });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }
    async getPlaylistHandler(request) {
        const { id: credentialId } = request.auth.credentials;

        const playlists = await this._playlistsService.getPlaylists(credentialId);
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyPlaylistOwner(id, credentialId);
        await this._playlistsService.deletePlaylistById(id);

        return {
            status: 'success',
            message: 'Playlist berhasil dihapus',
        };
    }

    // adding song to playlist handler
    async postSongToPlaylistHandler(request, h) {
        this._validator.validateSongPayload(request.payload);
        const { songId } = request.payload;
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyAccessUser(id, credentialId);
        await this._songService.getSongById(songId);
        const result = await this._playlistsService.addPlaylistSong(id, songId, credentialId);
        const response = h.response({
            status: 'success',
            message: 'Lagu ditambahkan ke playlist',
            data: {
                songId: result,
            }
        });
        response.code(201);
        return response;
    }

    async getSongFromPlaylistHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(id, credentialId);

        const data = await this._playlistsService.getSongsPlaylistById(id)
        const songs = await this._service.getPlaylistSongs(id);

        return {
            status: 'success',
            data: {
                playlist: {
                    id: data.id,
                    name: data.name,
                    username: data.username,
                    songs,
                },
            },
        }
    }

    async deleteSongFromPlaylistHandler(request) {
        const { id } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(id, credentialId);
        await this._playlistsService.deletePlaylistsong(id, songId);

        return {
            status: 'success',
            message: 'Lagu dihapus dari playlist',
        };
    }

    async getPlaylistActivitiesHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(id, credentialId);

        let activities = await this._playlistsService.getPlaylistActivities(id, credentialId);

        return {
            status: 'success',
            data: {
                playlistId: id,
                activities,
            }
        };
    }
}

module.exports = PlaylistHandler;