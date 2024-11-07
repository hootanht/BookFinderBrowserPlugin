async function getCurrentTabUrl() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab.url;
    } catch (error) {
        console.error('Error getting tab URL:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('resultsContainer');

    let isProcessing = false;

    // Global variables
    let currentPage = 1;
    const seenBooks = new Set();

    // Helper function to check for similar titles
    const isSimilarTitle = (title1, title2) => {
        const normalize = (str) => str.toLowerCase()
            .trim()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, ' ');
        
        const t1 = normalize(title1);
        const t2 = normalize(title2);
        
        return t1 === t2 || t1.includes(t2) || t2.includes(t1);
    };

    // Update performSearch to handle pagination
    const performSearch = async (page = 1) => {
        if (isProcessing) return;
        
        // Clear seen books if it's a new search (page 1)
        if (page === 1) {
            seenBooks.clear();
        }
        
        try {
            isProcessing = true;
            searchButton.disabled = true;
            searchButton.classList.add('loading');
            resultsContainer.innerHTML = '<div class="loading">Searching books...</div>';
            
            const searchTerm = searchInput.value.trim();
            const apiUrl = `http://localhost:5181/api/Book/search?query=${encodeURIComponent(searchTerm)}&page=${page}`;
            
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            updateResults(data);
            
        } catch (error) {
            console.error('Error:', error);
            resultsContainer.innerHTML = `
                <div class="error-message">
                    <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                    </svg>
                    <span>Error: ${error.message}</span>
                </div>
            `;
        } finally {
            isProcessing = false;
            searchButton.disabled = false;
            searchButton.classList.remove('loading');
        }
    };

    // Update results and pagination
    const updateResults = (data) => {
        resultsContainer.innerHTML = '';
        
        if (data.books && data.books.length > 0) {
            // Filter out duplicates with more sophisticated checking
            const uniqueBooks = data.books.reduce((acc, current) => {
                const isDuplicate = acc.some(book => 
                    isSimilarTitle(book.title, current.title)
                );
                
                if (!isDuplicate) {
                    acc.push(current);
                }
                return acc;
            }, []);

            // Create books grid
            const booksGrid = document.createElement('div');
            booksGrid.className = 'books-grid';
            
            uniqueBooks.forEach(book => {
                const bookElement = createBookCard(book);
                if (bookElement) booksGrid.appendChild(bookElement);
            });
            
            resultsContainer.appendChild(booksGrid);
            
            // Add pagination if needed
            if (data.pagination.totalPages > 1) {
                const paginationElement = createPagination(
                    data.pagination.currentPage,
                    data.pagination.totalPages
                );
                resultsContainer.appendChild(paginationElement);
            }
        } else {
            // Show no results message
            const searchTerm = searchInput.value.trim();
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <svg class="no-results-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" 
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"/>
                    </svg>
                    <h3 class="no-results-title">No Books Found</h3>
                    <p class="no-results-text">
                        We couldn't find any books matching "${searchTerm}"
                    </p>
                    <button class="retry-search-btn">
                        <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" 
                                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                        </svg>
                        Try Another Search
                    </button>
                </div>
            `;
        }
    };

    // Create pagination element
    const createPagination = (currentPage, totalPages) => {
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-button ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.disabled = currentPage === 1;
        prevButton.innerHTML = `
            <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        `;
        prevButton.onclick = () => handlePageChange(currentPage - 1);
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-button ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.disabled = currentPage === totalPages;
        nextButton.innerHTML = `
            <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        `;
        nextButton.onclick = () => handlePageChange(currentPage + 1);
        
        // Add buttons and page numbers
        paginationContainer.appendChild(prevButton);
        
        const pages = getPaginationRange(currentPage, totalPages);
        pages.forEach(page => {
            if (page === '...') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            } else {
                const pageButton = document.createElement('button');
                pageButton.className = `pagination-button ${page === currentPage ? 'active' : ''}`;
                pageButton.textContent = page;
                pageButton.onclick = () => handlePageChange(page);
                paginationContainer.appendChild(pageButton);
            }
        });
        
        paginationContainer.appendChild(nextButton);
        return paginationContainer;
    };

    // Handle page changes
    const handlePageChange = async (page) => {
        if (isProcessing) return;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await performSearch(page);
    };

    // Get pagination range
    const getPaginationRange = (current, total) => {
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        
        if (current <= 3) {
            return [1, 2, 3, 4, '...', total];
        }
        
        if (current >= total - 2) {
            return [1, '...', total - 3, total - 2, total - 1, total];
        }
        
        return [1, '...', current - 1, current, current + 1, '...', total];
    };

    const handleSearchButtonState = () => {
        if (isProcessing) {
            searchButton.classList.add('loading');
            searchButton.disabled = true;
        } else {
            searchButton.classList.remove('loading');
            searchButton.disabled = false;
        }
    };

    searchButton.addEventListener('click', () => {
        handleSearchButtonState();
        performSearch();
    });

    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearchButtonState();
            performSearch();
        }
    });

    searchInput.focus();

    let typingTimer;
    const doneTypingInterval = 500;

    searchInput.addEventListener('input', () => {
        searchButton.classList.add('ready');
        clearTimeout(typingTimer);
        
        if (searchInput.value) {
            typingTimer = setTimeout(() => {
                searchButton.classList.remove('ready');
            }, doneTypingInterval);
        }
    });

    performSearch();

    // Optional: Add this to your root variables if not already present
    document.documentElement.style.setProperty('--primary-color', '#2563eb');
    document.documentElement.style.setProperty('--primary-dark', '#1d4ed8');
}); 

// Create book card function
const createBookCard = (book) => {
    if (!book || !book.title) {
        console.warn('Invalid book data:', book);
        return null;
    }

    // Create URL-friendly slug from title
    const createSlug = (title) => {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-')     // Replace spaces with hyphens
            .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    };

    const baseUrl = 'https://refhub.ir/fa/refrence_detail/';
    const bookSlug = createSlug(book.title);
    const bookUrl = `${baseUrl}${bookSlug}/`;

    const bookElement = document.createElement('div');
    bookElement.className = 'book-card';
    
    bookElement.innerHTML = `
        <div class="book-image">
            <img src="${book.imageUrl || 'placeholder.png'}" 
                 alt="${book.title}"
                 onerror="this.src='placeholder.png'">
        </div>
        <div class="book-content">
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <div class="book-meta">
                    ${book.year ? `
                        <span class="meta-item book-year">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                            </svg>
                            ${book.year}
                        </span>
                    ` : ''}
                    ${book.publisher ? `
                        <span class="meta-item book-publisher">
                            <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/>
                            </svg>
                            ${book.publisher}
                        </span>
                    ` : ''}
                </div>
                ${book.tags && book.tags.length > 0 ? `
                    <div class="tags-section">
                        <div class="tags-icon-wrapper">
                            <svg class="tags-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" 
                                      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6z"/>
                            </svg>
                        </div>
                        <div class="book-tags">
                            ${book.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <a href="${bookUrl}" target="_blank" class="view-details-btn">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" 
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>View Details</span>
            </a>
        </div>
    `;

    return bookElement;
}; 