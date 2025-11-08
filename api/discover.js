// api/discover.js
// Note: Node.js versions supported by Vercel usually have 'fetch' available globally.

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// --- 1. IGDB Access Token Management ---
async function getAccessToken() {
    const tokenUrl = 'https://id.twitch.tv/oauth2/token';
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    });

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            body: params
        });

        if (!response.ok) {
            // Log details of the failure for debugging
            console.error(`Twitch Auth failed with status: ${response.status}`);
            const errorData = await response.json().catch(() => ({}));
            console.error('Twitch Auth Error Data:', errorData);
            throw new Error(`Authentication failed. Status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;

    } catch (error) {
        console.error('Twitch Auth Network Error:', error.message);
        throw new Error('Could not establish connection for authentication.');
    }
}

// --- 2. Serverless Function Handler ---
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).send('OK');
    }

    const { genre1, genre2 } = req.query;

    if (!genre1 || !genre2) {
        return res.status(400).json({ error: 'Please select two genre IDs (genre1 and genre2).' });
    }

    try {
        const accessToken = await getAccessToken();

        // The Core Logic: The IGDB Query (similar to the Postman body)
        const queryBody = `
            fields name, summary, rating, cover.image_id, involved_companies.company.name;
            where genres = [${genre1}, ${genre2}] & involved_companies.developer = true & rating > 60;
            sort rating desc;
            limit 10;
        `;

        const igdbResponse = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain' // Required for the query body format
            },
            body: queryBody
        });

        if (!igdbResponse.ok) {
            console.error(`IGDB Query failed with status: ${igdbResponse.status}`);
            const errorData = await igdbResponse.text(); // IGDB often sends text/plain errors
            console.error('IGDB Error Data:', errorData);
            throw new Error('Failed to fetch game data from IGDB.');
        }

        const data = await igdbResponse.json();

        // Simple formatting to clean up the data for the frontend
        const formattedGames = data.map(game => ({
            id: game.id,
            title: game.name,
            summary: game.summary,
            rating: game.rating ? game.rating.toFixed(1) : 'N/A',
            cover_url: game.cover ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg` : null,
            developer: game.involved_companies ? game.involved_companies[0].company.name : 'Unknown Studio'
        }));

        res.status(200).json(formattedGames);

    } catch (error) {
        console.error('API Handler Error:', error);
        res.status(500).json({ error: error.message || 'An unknown error occurred on the server.' });
    }
};