// api/discover.js
const axios = require('axios');
const apicalypse = require('apicalypse').default;

// Get keys securely from environment variables
const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// --- 1. IGDB Access Token Management ---
async function getAccessToken() {
    const tokenUrl = 'https://id.twitch.tv/oauth2/token';
    const params = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    };

    try {
        const response = await axios.post(tokenUrl, null, { params });
        return response.data.access_token;
    } catch (error) {
        console.error('Twitch Auth Error:', error.response.data);
        throw new Error('Could not authenticate with Twitch/IGDB.');
    }
}

// --- 2. Serverless Function Handler ---
module.exports = async (req, res) => {
    // Set CORS headers for the frontend to access the API safely
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }

    // Expecting query parameters: genre1 and genre2 (which will be genre IDs)
    const { genre1, genre2 } = req.query;

    if (!genre1 || !genre2) {
        return res.status(400).json({ error: 'Please specify two genre IDs (genre1 and genre2).' });
    }

    try {
        const accessToken = await getAccessToken();

        // The Core Logic: Query for games that match BOTH genres
        const response = await apicalypse({
            baseURL: 'https://api.igdb.com/v4',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
            }
        })
        .fields(['name', 'summary', 'rating', 'cover.image_id', 'involved_companies.company.name'])
        .where(`genres = [${genre1}, ${genre2}] & involved_companies.developer = true & rating > 60`) // Filters for BOTH genres, a developer, and a minimum rating
        .sort('rating', 'desc')
        .limit(10)
        .request('/games');

        // Simple formatting to clean up the data for the frontend
        const formattedGames = response.data.map(game => ({
            id: game.id,
            title: game.name,
            summary: game.summary,
            rating: game.rating ? game.rating.toFixed(1) : 'N/A',
            cover_url: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null,
            developer: game.involved_companies ? game.involved_companies[0].company.name : 'Unknown Studio'
        }));

        res.status(200).json(formattedGames);

    } catch (error) {
        console.error('IGDB Query Error:', error);
        res.status(500).json({ error: 'Failed to fetch game data.', detail: error.message });
    }
};