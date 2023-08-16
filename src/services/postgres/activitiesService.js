const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exception/invariantError');

class ActivitiesService {
    constructor() {
        this._pool = new Pool()
    }

    async addPlaylistActivity(playlistId, userId, songId) {
        const id = `activity-${nanoid(16)}`
        const time = new Date().toISOString()
        const query = {
            text: 'INSERT INTO playlist_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, 'add', time]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Aktifitas gagal ditambahkan')
        }
    }

    async deletePlaylistActivity(playlistId, userId, songId) {
        const id = `activity-${nanoid(16)}`
        const time = new Date().toISOString()
        const query = {
            text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
            values: [id, playlistId, songId, userId, 'delete', time]
        }

        const result = await this._pool.query(query)

        if (!result.rows[0].id) {
            throw new InvariantError('Aktifitas gagal dihapus')
        }
    }
}

module.exports = ActivitiesService;