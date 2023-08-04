require('dotenv').config();

const Hapi = require('@hapi/hapi');

//Importing album
const album = require('./api/album');
const AlbumService = require('./services/postgres/albumService');
//importing song
const song = require('./api/song');
const SongService = require('./services/postgres/songService');
//importing validator
const {
    songValidator,
    albumValidator
} = require('./validator/music');

const ClientError = require('./exception/clienError');

const init = async () => {
    const albumService = new AlbumService();
    const songService = new SongService();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register([
        {
            plugin: album,
            options: {
                service: albumService,
                validator: albumValidator,
            },
        },
        {
            plugin: song,
            options: {
                service: songService,
                validator: songValidator,
            },
        },
    ]);
    server.ext('onPreResponse', (request, h) => {
        // mendapatkan response dari request
        const { response } = request;
        if (response instanceof Error) {
            // penanganan client error secara internal.
            if (response instanceof ClientError) {
                const newResponse = h.response({
                    status: 'fail',
                    message: response.message,
                });
                newResponse.code(response.statusCode);
                return newResponse;
            }
            // penanganan client error oleh hapi (404, etc).
            if (!response.isServer) {
                return h.continue;
            }
            // penanganan server error 
            const newResponse = h.response({
                status: 'error',
                message: 'terjadi kegagalan pada server',
            });
            newResponse.code(500);
            return newResponse;
        }
        // jika bukan error, lanjutkan response sebelumnya
        return h.continue;
    });

    await server.start();
    console.log(`server berjalan pada ${server.info.uri}`);
}
init();