const PlaylistHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'playlists',
    version: '1.0.0',
    register: async (server, { playlistsService, songService, validator }) => {
        const playlistsHandler = new PlaylistHandler(playlistsService, songService, validator);
        server.route(routes(playlistsHandler));
    },
};