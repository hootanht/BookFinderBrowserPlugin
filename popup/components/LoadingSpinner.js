export class LoadingSpinner {
    render() {
        const element = document.createElement('div');
        element.className = 'loading';
        element.innerHTML = 'Searching books...';
        return element;
    }
} 