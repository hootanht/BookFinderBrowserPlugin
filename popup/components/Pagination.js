// Component for handling pagination
export class Pagination {
    constructor(currentPage, totalPages, onPageChange) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;
        this.onPageChange = onPageChange;
    }

    render() {
        const element = document.createElement('div');
        element.className = 'pagination';
        element.innerHTML = this.template;
        this.attachEventListeners(element);
        return element;
    }

    get template() {
        return `
            ${this.prevButtonTemplate}
            ${this.pageNumbersTemplate}
            ${this.nextButtonTemplate}
        `;
    }

    get prevButtonTemplate() {
        const disabled = this.currentPage === 1;
        return `
            <button class="pagination-button ${disabled ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}" 
                    ${disabled ? 'disabled' : ''}>
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
        `;
    }

    get nextButtonTemplate() {
        const disabled = this.currentPage === this.totalPages;
        return `
            <button class="pagination-button ${disabled ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}"
                    ${disabled ? 'disabled' : ''}>
                <svg class="pagination-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        `;
    }

    get pageNumbersTemplate() {
        return this.getPaginationRange()
            .map(page => {
                if (page === '...') {
                    return '<span class="pagination-ellipsis">...</span>';
                }
                return `
                    <button class="pagination-button ${page === this.currentPage ? 'active' : ''}" 
                            data-page="${page}">
                        ${page}
                    </button>
                `;
            })
            .join('');
    }

    getPaginationRange() {
        if (this.totalPages <= 7) {
            return Array.from({ length: this.totalPages }, (_, i) => i + 1);
        }
        
        if (this.currentPage <= 3) {
            return [1, 2, 3, 4, '...', this.totalPages];
        }
        
        if (this.currentPage >= this.totalPages - 2) {
            return [1, '...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages];
        }
        
        return [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages];
    }

    attachEventListeners(element) {
        element.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || button.disabled) return;
            
            const page = parseInt(button.dataset.page);
            if (!isNaN(page)) {
                this.onPageChange(page);
            }
        });
    }
} 