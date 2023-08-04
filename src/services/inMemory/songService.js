const { nanoid } = require('nanoid');
const InvariantError = require('../../exception/invariantError');
const NotFoundError = require('../../exception/notFoundError');

class SongService {
    constructor() {
        this._song = [];
    }
    addSong({ title, year, genre, performer, duration, albumId }) {
        const parsing = nanoid(16);
        const id = `song-${parsing}`;

        const newSong = {
            title, year, genre, performer, duration, albumId,
        }
        this._song.push(newSong);
        const isSuccess = this._song.filter(song => song.id === id).length > 0;
        if (!isSuccess) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
        return id;
    }

    getSongs() {
        return this._song;
    }

    getSongById(id) {
        const song = this._song.filter(s => s.id === id)[0];

        if (!song) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
        return song;
    }

    editSongById(id, { title, year, genre, performer }) {
        const index = this._song.findIndex(song => song.id === id);

        if (index === -1) {
            throw new NotFoundError('Gagal memperbarui data lagu. ID tidak ditemukan!')
        }

        this._song[index] = {
            ...this._song[index],
            title,
            year,
            genre,
            performer,
        }
    }

    deleteSongById(id) {
        const index = this._song.findIndex(song => song.id === id);

        if (index === -1) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
        }
        this._song.splice(index, 1);
    }
}
module.exports = SongService;