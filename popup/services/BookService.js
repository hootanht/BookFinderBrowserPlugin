// Service for handling book-related API calls
export class BookService {
    constructor(baseUrl = 'http://localhost:5181/api') {
        this.baseUrl = baseUrl;
    }

    async searchBooks(query, page = 1) {
        try {
            const url = new URL(`${this.baseUrl}/Book/search`);
            url.searchParams.append('query', query);
            url.searchParams.append('page', page);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error searching books:', error);
            throw error;
        }
    }
} 