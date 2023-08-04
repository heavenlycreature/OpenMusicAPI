const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/invariantError');
const { songDBToModel } = require('../../utils');
const NotFoundError = require('../../exception/notFoundError');

class SongService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({
        title, year, genre, performer, duration, albumId,
    }) {
        const songId = nanoid(16);
        const id = `song-${songId}`;

        const query = {
            text: 'INSERT INTO song VALUES ($1, $2, $3, $4, $5, $6, $7 ) RETURNING song_id',
            values: [id, title, year, genre, performer, duration, albumId],
        };
        const result = await this._pool.query(query);
        if (!result) {
            throw new InvariantError('Gagal menambahkan lagu');
        }
        return result.rows[0].song_id;
    }

    async getSongs() {
        const result = await this._pool.query('SELECT * FROM song');
        return result.rows.map(songDBToModel);
    }

    async getSongById(id) {
        const query = {
            text: 'SELECT * FROM song WHERE song_id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return result.rows.map(songDBToModel)[0];
    }

    async getSongByPerformer(performer) {
        const query = {
            text: ' SELECT * FROM song WHERE LOWER(performer) LIKE ($1)',
            values: [`%${performer}%`],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Tidak dapat menemukan yang kamu cari');
        }
        return result.rows.map(songDBToModel);
    }

    async getSongByTitle(title) {
        const query = {
            text: 'SELECT * FROM song WHERE LOWER(title) LIKE LOWER($1)',
            values: [`%${title}%`],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Tidak dapat menemukan yang kamu cari');
        }
        return result.rows.map(songDBToModel);
    }

    async getSongByTitlePerformer(title, performer) {
        const query = {
            text: 'SELECT * FROM song WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE($2)',
            values: [`%${title}%`, `%${performer}%`],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Tidak dapat menemukan yang kamu cari');
        }
        return result.rows.map(songDBToModel);
    }

    async editSongById(id, {
        title, year, genre, performer, duration, albumId,
    }) {
        const query = {
            text: 'UPDATE song SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "album_id" = $6 WHERE song_id = $7 RETURNING song_id',
            values: [title, year, genre, performer, duration, albumId, id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. ID kosong');
        }
        return result;
    }

    async deleteSongById(id) {
        const query = {
            text: 'DELETE FROM song WHERE song_id = $1 RETURNING song_id',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus lagu. ID kosong');

        }
    }
}
module.exports = SongService;
