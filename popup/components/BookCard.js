import { UrlUtils } from '../utils/UrlUtils.js';

export class BookCard {
    constructor(book) {
        this.book = book;
    }

    render() {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = this.template;
        return card;
    }

    get template() {
        const bookUrl = UrlUtils.getBookDetailUrl(this.book.title);
        
        return `
            <div class="book-image">
                <img src="${this.book.imageUrl || 'placeholder.png'}" 
                     alt="${this.book.title}"
                     onerror="this.src='placeholder.png'">
            </div>
            <div class="book-content">
                <div class="book-info">
                    <h3 class="book-title">${this.book.title}</h3>
                    ${this.metadataTemplate}
                    ${this.tagsTemplate}
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
    }

    get metadataTemplate() {
        if (!this.book.year && !this.book.skillLevel) return '';
        
        return `
            <div class="book-meta">
                ${this.book.year ? this.yearTemplate : ''}
                ${this.book.skillLevel ? this.skillLevelTemplate : ''}
            </div>
        `;
    }

    get yearTemplate() {
        return `
            <span class="meta-item book-year">
                <svg class="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" 
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>
                </svg>
                ${this.book.year}
            </span>
        `;
    }

    get skillLevelTemplate() {
        return `
            <span class="meta-item book-skill-level">
                ${this.book.skillLevel}
            </span>
        `;
    }

    get tagsTemplate() {
        if (!this.book.tags?.length) return '';
        
        return `
            <div class="tags-section">
                <div class="book-tags">
                    ${this.book.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }
} 