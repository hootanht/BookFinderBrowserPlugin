export class ErrorMessage {
    constructor(message) {
        this.message = message;
    }

    render() {
        const element = document.createElement('div');
        element.className = 'error-message';
        element.innerHTML = `
            <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" 
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
            </svg>
            <span>Error: ${this.message}</span>
        `;
        return element;
    }
} 