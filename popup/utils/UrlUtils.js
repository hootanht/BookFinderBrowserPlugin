// Utility functions for URL handling
export class UrlUtils {
    static createSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static getBookDetailUrl(title) {
        const baseUrl = 'https://refhub.ir/fa/refrence_detail/';
        const slug = this.createSlug(title);
        return `${baseUrl}${slug}/`;
    }
} 