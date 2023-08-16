const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const { playlistId } = await this._service.addPlaylist({
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

        const playlists = await this._service.getPlaylists(credentialId);
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

        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id);

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
        const result = await this._service.addPlaylistSong(id, songId, credentialId);
        const response = h.response({
            status: 'success',
            message: 'Lagu ditambahkan ke playlist',
            data: {
                result,
            }
        });
        response.code(201);
        return response;
    }

    async getSongFromPlaylistHandler(request) {
        const { id } = request.params;
        const { id: credentialId } = request.auth.credentials;

        const data = await this._service.getPlaylistById(id)

        await this._service.verifyAccessUser(id, credentialId);

        const playlist = await this._service.getPlaylistSongs(id);

        const result = playlist.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
        }))
        return {
            status: 'success',
            data: {
                playlist: {
                    ...data,
                    songs: result
                }
            }
        }
    }

    async deleteSongFromPlaylistHandler(request) {
        const { id } = request.params;
        const { songId } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyAccessUser(id, credentialId);
        await this._service.deletePlaylistsong(id, songId);

        return {
            status: 'success',
            message: 'Lagu dihapus dari playlist',
        };
    }

    async getPlaylistActivitiesHandler(request) {
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._service.verifyAccessUser(credentialId, playlistId);

        const activitiesFiltered = await this._service.getPlaylistActivities(playlistId);

        return {
            status: 'success',
            data: {
                playlistId,
                activities: activitiesFiltered.map((activity) => ({
                    username: activity.username,
                    title: activity.title,
                    action: activity.action,
                    time: activity.time,
                })),
            },
        };
    }
}

module.exports = PlaylistHandler;