/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.addColumns('album', {
        cover: {
            type: 'TEXT',
        }
    });
};

exports.down = (pgm) => {
    pgm.dropTable('album');
};
