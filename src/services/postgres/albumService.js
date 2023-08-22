const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/invariantError');
const { albumDBToModel } = require('../../utils');
const NotFoundError = require('../../exception/notFoundError');
const ClientError = require('../../exception/clienError');

class AlbumService {
    constructor(cacheService) {
        this._pool = new Pool();
        this._cacheService = cacheService;
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
        await this._cacheService.delete('albums');
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

        await this._cacheService.delete(`albums:${id}`);
    }

    // album likes
    async verifyUserLike(albumId, userId) {
        await this.getAlbumById(albumId);
        const query = {
            text: 'SELECT * FROM user_album_likes WHERE album_id = $1 AND users_id = $2 ',
            values: [albumId, userId],
        };

        const result = await this._pool.query(query);

        if (result.rowCount > 0) {
            throw new ClientError('Anda sudah memberi like');
        }
    }

    async userLike(userId, albumId) {
        const id = `like-${nanoid(16)}`
        const query = {
            text: 'INSERT INTO user_album_likes (id, users_id, album_id) VALUES ($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };
        const result = await this._pool.query(query);
        if (!result.rowCount) {
            throw new InvariantError('Like album gagal ditambahkan');
        }
        await this._cacheService.delete(`likes:${albumId}`);
        return result.rows[0].id;
    }

    async userDislike(userId, albumId) {
        const query = {
            text: 'DELETE FROM user_album_likes WHERE users_id = $1 AND album_id = $2',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rowCount) {
            throw new InvariantError('Like album gagal dihapus');
        }
        await this._cacheService.delete(`likes:${albumId}`);
    }

    async getLikeAlbum(albumId) {
        try {
            const result = await this._cacheService.get(`likes:${albumId}`);
            return {
                likes:
                    JSON.parse(result),
                cached: true,
            };
        } catch (error) {
            const query = {
                text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };
            const result = await this._pool.query(query);
            if (!result.rowCount) {
                throw new NotFoundError('Album tidak ditemukan');
            }

            await this._cacheService.set(`likes:${albumId}`, JSON.stringify(result.rowCount));

            return {
                likes: result.rowCount,
                cached: false
            };
        }
    }
}
module.exports = AlbumService;
