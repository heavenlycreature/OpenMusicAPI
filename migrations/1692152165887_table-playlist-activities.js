/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('playlist_activities', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'TEXT',
            notNull: true,
        },
        song_id: {
            type: 'INTEGER',
            notNull: true,
        },
        user_id: {
            type: 'TEXT',
            notNull: true,
        },
        action: {
            type: 'TEXT',
            notNull: true,
        },
        time: {
            type: 'INTEGER',
            notNull: true,
        },
    });
    pgm.addConstraint(
        'playlist_activities',
        'fk_playlist_song_activities.playlist_id_on_playlists.id',
        'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
    );
    pgm.addConstraint('playlist_activities', 'fk_playlist_activities.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES song(song_id) ON DELETE CASCADE');
    pgm.addConstraint('playlist_activities', 'fk_playlist_activities.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropConstraint('fk_playlist_song_activities.playlist_id_on_playlists.id');
    pgm.dropTable('playlist_activities');
};
