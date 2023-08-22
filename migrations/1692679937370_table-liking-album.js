/* eslint-disable camelcase */


exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    users_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  }, {
    constraints: {
      foreignKeys: [
        {
          references: 'users(id)',
          columns: 'users_id',
          onDelete: 'CASCADE',
        },
        {
          references: 'album(album_id)',
          columns: 'album_id',
          onDelete: 'CASCADE',
        },
      ],
    },
  })
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};
