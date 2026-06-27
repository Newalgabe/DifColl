const API_URL = "/api/nexus";

const NexusService = {
    async getNexusCollections(userId) {
        try {
            const response = await fetch(`/api/Nexus/collections?userId=${userId}`, {
                method: 'GET',
                credentials: 'include', // Include credentials if needed
            });

            // Check if response is okay
            if (!response.ok) {
                // Handle non-2xx responses here (e.g., 404, 500)
                throw new Error('Network response was not ok');
            }

            const data = await response.json(); // Parse the response as JSON
            return data; // Return the parsed data
        } catch (error) {
            console.error('Error fetching Nexus collections:', error);
            throw error; // Rethrow the error to be handled in MyNexus
        }
    },

    getUserBooks: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/books/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user books.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching user books:", error);
            throw error;
        }
    },

    getUserMovies: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/movies/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user movies.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching user movies:", error);
            throw error;
        }
    },

    getUserGames: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/games/${userId}`);
            if (!response.ok) throw new Error("Failed to fetch user games.");
            return await response.json();
        } catch (error) {
            console.error("Error fetching user games:", error);
            throw error;
        }
    },

    addBookToNexus: async (userId, book) => {
        try {
            const response = await fetch(`${API_URL}/add/book/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(book),
            });
            if (!response.ok) throw new Error("Failed to add book to Nexus.");
        } catch (error) {
            console.error("Error adding book to Nexus:", error);
            throw error;
        }
    },

    addMovieToNexus: async (userId, movie) => {
        try {
            const response = await fetch(`${API_URL}/add/movie/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(movie),
            });
            if (!response.ok) throw new Error("Failed to add movie to Nexus.");
        } catch (error) {
            console.error("Error adding movie to Nexus:", error);
            throw error;
        }
    },

    addGameToNexus: async (userId, game) => {
        try {
            const response = await fetch(`${API_URL}/add/game/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(game),
            });
            if (!response.ok) throw new Error("Failed to add game to Nexus.");
        } catch (error) {
            console.error("Error adding game to Nexus:", error);
            throw error;
        }
    },


    removeBookFromNexus: async (userId, bookId) => {
        try {
            const response = await fetch(`/api/Nexus/remove/book/${userId}/${bookId}`, {
                method: "DELETE",
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Failed to remove book from Nexus.");
        } catch (error) {
            console.error("Error removing book from Nexus:", error);
            throw error;
        }
    },

    async removeMovieFromNexus(userId, movieId) {
        try {
            const response = await fetch(`/api/Nexus/remove/movie/${userId}/${movieId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error("Failed to remove movie from Nexus.");
            }
        } catch (error) {
            console.error("Error removing movie from Nexus:", error);
            throw error;
        }
    },

    removeGameFromNexus: async (userId, gameId) => {
        try {
            const response = await fetch(`/api/Nexus/remove/game/${userId}/${gameId}`, {
                method: "DELETE",
                credentials: 'include',
            });
            if (!response.ok) throw new Error("Failed to remove game from Nexus.");
        } catch (error) {
            console.error("Error removing game from Nexus:", error);
            throw error;
        }
    },
};

export default NexusService;