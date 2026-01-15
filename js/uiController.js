export function updateStats(editor, counter) {
    if (!editor || !counter) return;
    
    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    const lines = text ? text.split('\n').length : 1;
    
    counter.innerHTML = `
        <span><i class="fas fa-file-alt mr-2"></i>${words} Words</span>
        <span><i class="fas fa-text-height mr-2"></i>${chars} Chars</span>
        <span><i class="fas fa-bars mr-2"></i>${lines} Lines</span>
    `;
}

export function clearAll(editor, counter) {
    if (editor) {
        editor.value = '';
        updateStats(editor, counter);
        flashStatus('CLEARED');
    }
}

export function copyToClipboard(editor) {
    if (!editor || !editor.value.trim()) {
        flashStatus('EMPTY');
        return;
    }
    
    const textArea = document.createElement("textarea");
    textArea.value = editor.value;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const btn = document.getElementById('copy-btn');
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> Copied to Clipboard!';
            btn.classList.add('success-anim');
            
            setTimeout(() => {
                btn.innerHTML = original;
                btn.classList.remove('success-anim');
            }, 2000);
            
            flashStatus('COPIED');
        }
    } catch (err) {
        console.error('Failed to copy text:', err);
        flashStatus('ERROR');
    }
    
    document.body.removeChild(textArea);
}

export function flashStatus(status = 'CLEANED') {
    const pill = document.getElementById('status-pill');
    if (!pill) return;
    
    const original = pill.innerHTML;
    const colors = {
        'CLEANED': '#10b981',
        'COPIED': '#3b82f6',
        'CLEARED': '#ef4444',
        'ERROR': '#dc2626',
        'EMPTY': '#f59e0b'
    };
    
    const color = colors[status] || '#6366f1';
    
    pill.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: ${color}"></span>
        ${status}
    `;
    
    setTimeout(() => {
        pill.innerHTML = original;
    }, 1500);
}

// Add keyboard shortcuts
export function initKeyboardShortcuts(editor) {
    document.addEventListener('keydown', (e) => {
        if (!editor) return;
        
        // Ctrl/Cmd + Enter to copy
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            copyToClipboard(editor);
        }
        
        // Ctrl/Cmd + K to clear
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            clearAll(editor, document.getElementById('counter'));
        }
        
        // Ctrl/Cmd + 1-5 for filters
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const filters = ['trim-openings', 'trim-closures', 'clean-md', 'normalize', 'de-cliche'];
            const index = parseInt(e.key) - 1;
            if (filters[index]) {
                processText(editor, filters[index]);
                updateStats(editor, document.getElementById('counter'));
                flashStatus('CLEANED');
            }
        }
    });
}