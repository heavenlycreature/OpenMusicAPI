/* eslint-disable camelcase */

exports.up = pgm => {
    pgm.createTable('song', {
        song_id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        title: {
            type: 'TEXT',
            notNull: true,
        },
        year: {
            type: 'INT',
            notNull: true,
        },
        genre: {
            type: 'TEXT',
            notNull: true,
        },
        performer: {
            type: 'TEXT',
            notNull: true,
        },
        duration: {
            type: 'INT',
        },
        album_id: {
            type: 'TEXT',
        }
    });
    pgm.createTable('album', {
        album_id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'TEXT',
            notNull: true,
        },
        year: {
            type: 'INT',
            notNull: true,
        },
    });
};

exports.down = pgm => {
    pgm.dropTable('song');
    pgm.dropTable('album');
};
