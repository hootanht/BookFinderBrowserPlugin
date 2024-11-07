import { BookService } from './services/BookService.js';
import { BookCard } from './components/BookCard.js';
import { Pagination } from './components/Pagination.js';
import { ErrorMessage } from './components/ErrorMessage.js';
import { LoadingSpinner } from './components/LoadingSpinner.js';
import { NoResults } from './components/NoResults.js';

export class App {
    constructor() {
        this.bookService = new BookService();
        this.initializeElements();
        this.initializeState();
        this.bindEvents();
        this.handleSearch();
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchButton = document.getElementById('searchButton');
        this.resultsContainer = document.getElementById('resultsContainer');
    }

    initializeState() {
        this.isLoading = false;
        this.currentPage = 1;
        this.seenBooks = new Set();
    }

    bindEvents() {
        this.searchButton.addEventListener('click', () => this.handleSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
    }

    async handleSearch(page = 1) {
        if (this.isLoading) return;

        try {
            this.startLoading();
            if (page === 1) this.seenBooks.clear();

            const query = this.searchInput?.value?.trim() || '';
            const response = await this.bookService.searchBooks(query, page);
            this.handleSearchResponse(response);
        } catch (error) {
            this.showError(error);
        } finally {
            this.stopLoading();
        }
    }

    handleSearchResponse(data) {
        this.clearResults();

        if (data.books?.length > 0) {
            const uniqueBooks = this.filterDuplicates(data.books);
            this.displayBooks(uniqueBooks);
            
            if (data.pagination.totalPages > 1) {
                this.displayPagination(data.pagination);
            }
        } else {
            this.displayNoResults();
        }
    }

    filterDuplicates(books) {
        return books.filter(book => {
            const bookKey = book.title.toLowerCase().trim();
            if (this.seenBooks.has(bookKey)) return false;
            this.seenBooks.add(bookKey);
            return true;
        });
    }

    displayBooks(books) {
        const booksGrid = document.createElement('div');
        booksGrid.className = 'books-grid';
        
        books.forEach(book => {
            const bookCard = new BookCard(book);
            booksGrid.appendChild(bookCard.render());
        });
        
        this.resultsContainer.appendChild(booksGrid);
    }

    displayPagination(pagination) {
        const paginationComponent = new Pagination(
            pagination.currentPage,
            pagination.totalPages,
            (page) => this.handlePageChange(page)
        );
        this.resultsContainer.appendChild(paginationComponent.render());
    }

    async handlePageChange(page) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await this.handleSearch(page);
    }

    startLoading() {
        this.isLoading = true;
        this.searchButton.disabled = true;
        this.searchButton.classList.add('loading');
        this.clearResults();
        this.resultsContainer.appendChild(new LoadingSpinner().render());
    }

    stopLoading() {
        this.isLoading = false;
        this.searchButton.disabled = false;
        this.searchButton.classList.remove('loading');
    }

    displayNoResults() {
        const noResults = new NoResults(
            this.searchInput.value.trim(),
            () => this.searchInput.focus()
        );
        this.resultsContainer.appendChild(noResults.render());
    }

    showError(error) {
        const errorMessage = new ErrorMessage(error.message);
        this.clearResults();
        this.resultsContainer.appendChild(errorMessage.render());
    }

    clearResults() {
        this.resultsContainer.innerHTML = '';
    }
} 