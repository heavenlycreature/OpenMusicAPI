const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariantError');
const NotFoundError = require('../../exception/notFoundError');

class AlbumService {
    constructor() {
        this._album = [];
    }
    addAlbum({ name, year }) {
        const parsing = nanoid(16);
        const id = `album-${parsing}`;

        const newAlbum = {
            name, year, id,
        }
        this._album.push(newAlbum)
        const isSuccess = this._album.filter(album => album.id === id).length > 0;
        if (!isSuccess) {
            throw new InvariantError('Album gagal ditambahkan')
        }
        return id;
    }

    getAlbums() {
        return this._album;
    }

    getAlbumById(id) {
        const album = this._album.filter(a => a.id === id)[0];

        if (!album) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return album;
    }

    editAlbumById(id, { name, year }) {
        const index = this._album.findIndex(album => album.id === id);

        if (index === -1) {
            throw new NotFoundError('Gagal memperbarui data album. ID tidak ditemukan!')
        }

        this._album[index] = {
            ...this._album[index],
            name,
            year,
        }
    }

    deleteAlbumById(id) {
        const index = this._album.findIndex(album => album.id === id);

        if (index === -1) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
        }
        this._album.splice(index, 1)
    }
}
module.exports = AlbumService;