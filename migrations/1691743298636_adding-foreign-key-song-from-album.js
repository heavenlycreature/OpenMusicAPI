/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addConstraint(
        'song',
        'fk_song_album',
        'FOREIGN KEY("album_id") REFERENCES album(album_id) ON DELETE CASCADE'
    );
};

exports.down = (pgm) => {
    pgm.dropConstraint('song', 'fk_song_album');
};
