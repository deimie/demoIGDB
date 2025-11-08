import React, { useState } from 'react';
import { genres } from '../data/genres';

export default function GameFinder() {
    const [genre1, setGenre1] = useState('');
    const [genre2, setGenre2] = useState('');
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const findGames = async () => {
        if (!genre1 || !genre2) {
            setError('Please select two genres');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/discover?genre1=${genre1}&genre2=${genre2}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch games');
            }

            setGames(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="game-finder">
            <h1>Game Genre Explorer</h1>
            <p>Select two genres to discover games that combine both styles!</p>

            <div className="genre-selectors">
                <select 
                    value={genre1} 
                    onChange={(e) => {
                        setGenre1(e.target.value);
                        // Clear genre2 if it matches the newly selected genre1
                        if (e.target.value === genre2) {
                            setGenre2('');
                        }
                    }}
                    className="genre-select"
                >
                    <option value="">Select first genre...</option>
                    {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>

                <select 
                    value={genre2} 
                    onChange={(e) => setGenre2(e.target.value)}
                    className="genre-select"
                >
                    <option value="">Select second genre...</option>
                    {genres.filter(genre => genre.id.toString() !== genre1).map(genre => (
                        <option key={genre.id} value={genre.id}>
                            {genre.name}
                        </option>
                    ))}
                </select>

                <button 
                    onClick={findGames} 
                    className="find-button"
                    disabled={loading}
                >
                    {loading ? 'Searching...' : 'Find Games'}
                </button>
            </div>

            {error && <div className="error">{error}</div>}

            <div className="games-grid">
                {games.map(game => (
                    <div key={game.id} className="game-card">
                        {game.cover_url && (
                            <img 
                                src={game.cover_url} 
                                alt={`${game.title} cover`} 
                                className="game-cover"
                            />
                        )}
                        <div className="game-info">
                            <h2>{game.title}</h2>
                            <p className="developer">by {game.developer}</p>
                            {game.rating !== 'N/A' && (
                                <div className="rating">Rating: {game.rating}</div>
                            )}
                            <p className="summary">{game.summary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}