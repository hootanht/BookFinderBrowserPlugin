export class NoResults {
    constructor(searchTerm, onRetry) {
        this.searchTerm = searchTerm;
        this.onRetry = onRetry;
    }

    render() {
        const element = document.createElement('div');
        element.className = 'no-results';
        element.innerHTML = `
            <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" 
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/>
            </svg>
            <h3 class="no-results-title">No Books Found</h3>
            <p class="no-results-text">
                We couldn't find any books matching "${this.searchTerm}"
            </p>
            <button class="retry-search-btn">
                <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" 
                          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                Try Another Search
            </button>
        `;

        element.querySelector('.retry-search-btn').addEventListener('click', this.onRetry);
        return element;
    }
} 