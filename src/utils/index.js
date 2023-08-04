//song Model
const songDBToModel = ({
    song_id,
    title,
    year,
    genre,
    performer,
    duration,
    album_id,
}) => ({
    id: song_id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId: album_id,
});
//album Model
const albumDBToModel = ({
    album_id,
    name,
    year,
}) => ({
    id: album_id,
    name,
    year,
});

module.exports = { songDBToModel, albumDBToModel };