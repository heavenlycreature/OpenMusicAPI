require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const path = require('path');
const Inert = require('@hapi/inert');

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
// users
const users = require('./api/users');
const UsersService = require('./services/postgres/userService');
const UsersValidator = require('./validator/users');

// authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authenticationService');
const TokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlist
const playlists = require('./api/playlist');
const PlaylistsService = require('./services/postgres/playlistService');
const PlaylistValidator = require('./validator/playlist');

// Collaboration
const collaborations = require('./api/collaboration');
const CollaborationsService = require('./services/postgres/collaborationService');
const CollaborationsValidator = require('./validator/collaboration');

// exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/producerService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/storageService');
const UploadsValidator = require('./validator/uploads')

// cache 
const CacheService = require('./services/redis/cacheService');


// error handling
const ClientError = require('./exception/clienError');

const init = async () => {
    const cacheService = new CacheService();
    const songService = new SongService();
    const albumService = new AlbumService(cacheService);
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const collaborationsService = new CollaborationsService();
    const playlistsService = new PlaylistsService(collaborationsService);
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'), cacheService);


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
            plugin: Jwt,
        },
        {
            plugin: Inert,
        },
    ]);

    server.auth.strategy('openmusic_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE,
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id,
            },
        }),
    });


    await server.register([
        {
            plugin: album,
            options: {
                service: albumService,
                storageService,
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
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UsersValidator,
            },
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
        {
            plugin: playlists,
            options: {
                playlistsService,
                songService,
                validator: PlaylistValidator,
            },
        },
        {
            plugin: collaborations,
            options: {
                collaborationsService,
                playlistsService,
                usersService,
                validator: CollaborationsValidator,
            },
        },
        {
            plugin: _exports,
            options: {
                service: ProducerService,
                validator: ExportsValidator,
                playlistsService,
            },
        },
        {
            plugin: uploads,
            options: {
                service: storageService,
                validator: UploadsValidator,
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
                message: 'Maaf terjadi kegagalan pada server kami',
            });
            newResponse.code(500);
            console.error(response);
            return newResponse;
        }
        // jika bukan error, lanjutkan response sebelumnya
        return h.continue;
    });

    await server.start();
    console.log(`server berjalan pada ${server.info.uri}`);
}
init();