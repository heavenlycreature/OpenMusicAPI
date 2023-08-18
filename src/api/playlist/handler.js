const autoBind = require('auto-bind');

class PlaylistHandler {
    constructor(playlistsService, songService, validator) {
        this._playlistsService = playlistsService;
        this._songService = songService;
        this._validator = validator;

        autoBind(this);
    }

    async postPlaylistHandler(request, h) {
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;

        const playlistId = await this._playlistsService.addPlaylist({
            name,
            credentialId,
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
        const { songId } = request.payload;
        const { id: playlistId } = request.params;
        this._validator.validateSongPayload({ playlistId, songId });
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(credentialId, playlistId);
        await this._songService.getSongById(songId);
        const result = await this._playlistsService.addPlaylistSong(playlistId, songId);
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
        const { id: playlistId } = request.params;
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(credentialId, playlistId);

        const data = await this._playlistsService.getSongsByPlaylistId(playlistId)
        const songs = await this._playlistsService.getPlaylistSongs(playlistId);
        const maping = songs.map((song) => ({
            id: song.song_id,
            title: song.title,
            performer: song.performer
        }))

        return {
            status: 'success',
            data: {
                playlist: {
                    ...data,
                    songs: maping
                }
            },
        }
    }

    async deleteSongFromPlaylistHandler(request) {
        const { id: playlistId } = request.params;
        const { songId } = request.payload;
        this._validator.validateSongPayload({ playlistId, songId });
        const { id: credentialId } = request.auth.credentials;

        await this._playlistsService.verifyAccessUser(credentialId, playlistId);
        await this._playlistsService.deletePlaylistSong(playlistId, songId);

        return {
            status: 'success',
            message: 'Lagu dihapus dari playlist',
        };
    }

    // async getPlaylistActivitiesHandler(request) {
    //     const { id } = request.params;
    //     const { id: credentialId } = request.auth.credentials;

    //     await this._playlistsService.verifyAccessUser(credentialId, id);

    //     let activities = await this._playlistsService.getPlaylistActivities(id, credentialId);

    //     return {
    //         status: 'success',
    //         data: {
    //             playlistId: id,
    //             activities,
    //         }
    //     };
    // }
}

module.exports = PlaylistHandler;