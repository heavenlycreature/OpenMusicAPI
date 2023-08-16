const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/invariantError')
const AuthorizationError = require('../../exception/authorizationsError')
const NotFoundError = require('../../exception/notFoundError')

class PlaylistsService {
    constructor(songService, collaborationsService, activitiesService) {
        this._pool = new Pool()
        this._songService = songService
        this._collaborationsService = collaborationsService
        this._activitiesService = activitiesService
    }

    async addPlaylist({ playlistName, owner }) {
        const id = `playlist-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistName, owner]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal ditambahkan')
        }

        return result.rows[0].id
    }

    async getPlaylists(userId) {
        const query = {
            text: 'SELECT a.id, a.name, b.username FROM playlists a LEFT JOIN users b on a.owner = b.id LEFT JOIN collaborations c on a.id = c.playlist_id WHERE a.owner = $1 OR c.user_id = $1',
            values: [userId]
        }

        const result = await this._pool.query(query)

        return result.rows
    }

    async getPlaylistById(playlistId) {
        const query = {
            text: 'SELECT a.id, a.name, b.username FROM playlists a JOIN users b ON a.owner = b.id WHERE a.id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        return result.rows[0]
    }

    async deletePlaylistById(playlistId) {
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Playlist gagal dihapus, Id tidak ditemukan')
        }
    }

    // Verify data
    async verifyPlaylistOwner(playlistId, owner) {
        const query = {
            text: 'SELECT * FROM playlists WHERE id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new NotFoundError('Playlist tidak ditemukan')
        }

        const playlist = result.rows[0]

        if (playlist.owner !== owner) {
            throw new AuthorizationError('Anda tidak memiliki akses untuk resource ini')
        }
    }

    async verifyAccessUser(userId, playlistId) {
        try {
            await this.verifyPlaylistOwner(playlistId, userId)
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error
            }
            try {
                await this._collaborationsService.verifyCollaborator(playlistId, userId)
            } catch {
                throw error
            }
        }
    }

    async addPlaylistSong(playlistId, songId, userId) {
        await this._songsService.getSongById(songId)
        const id = `playlist-song-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Playlist song gagal ditambahkan')
        }

        await this._activitiesService.addPlaylistActivity(playlistId, userId, songId)
    }

    async getPlaylistSongs(playlistId) {
        const query = {
            text: 'SELECT a.*, b.id, b.title, b.performer FROM playlist_songs a LEFT JOIN songs b ON a.song_id = b.id WHERE a.playlist_id = $1',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Playlist song tidak ditemukan')
        }

        return result.rows
    }

    async deletePlaylistSong(playlistId, songId, userId) {
        const query = {
            text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
            values: [playlistId, songId]
        }

        const result = await this._pool.query(query)

        if (!result.rowCount) {
            throw new InvariantError('Playlist song gagal dihapus')
        }

        await this._activitiesService.deletePlaylistActivity(playlistId, userId, songId)
    }

    async getPlaylistActivities(playlistId) {
        const query = {
            text: 'SELECT b.username, c.title, a.action, a.time FROM playlist_song_activities a left join users b on a.user_id = b.id left join songs c on c.id = a.song_id  WHERE a.playlist_id = $1 ORDER BY a.time ASC',
            values: [playlistId]
        }

        const result = await this._pool.query(query)

        return result.rows
    }
}

module.exports = PlaylistsService