const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/invariantError');
const { albumDBToModel } = require('../../utils');
const NotFoundError = require('../../exception/notFoundError');

class AlbumService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({ name, year }) {
        const parsing = nanoid(16);
        const albumId = `album-${parsing}`;

        const query = {
            text: 'INSERT INTO album VALUES($1, $2, $3) RETURNING album_id',
            values: [albumId, name, year],
        };
        const result = await this._pool.query(query);
        if (!result) {
            throw new InvariantError('Album gagal ditambahkan');

        }
        return result.rows[0].album_id;
    }

    async getAlbums() {
        const result = await this._pool.query('SELECT * FROM album');
        return result.rows.map(albumDBToModel);
    }

    async getAlbumById(id) {
        const query = {
            text: 'SELECT album.album_id, name, album.year, song_id, song.title, song.performer FROM album LEFT JOIN song ON song.album_id = album.album_id WHERE album.album_id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new NotFoundError('Album tidak ditemukan');
        }
        return result;
    }

    async editAlbumById(id, { name, year }) {
        const query = {
            text: 'UPDATE album SET name = $1, year = $2 WHERE album_id = $3 RETURNING album_id',
            values: [name, year, id],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. ID kosong');
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: 'DELETE FROM album WHERE album_id = $1 RETURNING album_id',
            values: [id],
        }
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal menghapus album. ID kosong');
        }
    }
}
module.exports = AlbumService;
