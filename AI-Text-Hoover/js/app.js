import { processText } from './textProcessor.js';
import { updateStats, clearAll, copyToClipboard, flashStatus } from './uiController.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('main-input');
    const counter = document.getElementById('counter');
    
    // Set up event listeners
    if (editor) {
        editor.addEventListener('input', () => updateStats(editor, counter));
        updateStats(editor, counter); // Initial stats
    }
    
    // Make functions globally available for button onclick handlers
    window.processText = (task) => {
        processText(editor, task);
        updateStats(editor, counter);
        flashStatus();
    };
    
    window.clearAll = () => clearAll(editor, counter);
    window.copyToClipboard = () => copyToClipboard(editor);
});