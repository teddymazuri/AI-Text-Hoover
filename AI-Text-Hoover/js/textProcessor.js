export function processText(editor, task) {
    if (!editor || !editor.value.trim()) return;
    
    let text = editor.value;
    
    switch(task) {
        case 'clean-md':
            text = cleanMarkdown(text);
            break;
        case 'normalize':
            text = normalizeSpacing(text);
            break;
        case 'trim-openings':
            text = trimOpenings(text);
            break;
        case 'trim-closures':
            text = trimClosures(text);
            break;
        case 'trim-AI-text':
            text = trimAIText(text);
            break;
        case 'de-cliche':
            text = removeCliches(text);
            break;
        case 'remove-numbers':
            text = removeListNumbers(text);
            break;
        case 'fix-apostrophes':
            text = fixApostrophes(text);
            break;
    }
    
    editor.value = text.trim();
    return text;
}

// Aggressive Trim Openings
function trimOpenings(text) {
    if (!text || typeof text !== "string") return text;

    const openerPatterns = [
        // Common AI openers
        /^(here is|here's|here are)\s+(a|an|the|some|your)\b/i,
        /^(certainly|sure|absolutely|of course)\b/i,
        /^(i can|i will|i'll|let me|allow me to)\b/i,
        /^(thank you for|thanks for)\s+(your|the)\b/i,
        /^in response to\s+(your|the)\b/i,
        /^based on\s+(your|the)\b/i,
        /^to\s+(answer|address|respond to)\s+(your|the)\b/i,
        /^great\s+(question|request|prompt)\b/i,
        /^as\s+(requested|you asked)\b/i,
        /^below\s+(is|are)\b/i,
        /^following\s+(is|are)\b/i,
        /^let's\s+(dive|jump|get)\b/i,
        /^(alright|okay|so|well|now)\s*,?\s*(let me|i'll|i will)\b/i
    ];

    let lines = text.trim().split("\n").map(l => l.trim());

    let removed = 0;
    const maxRemove = 3; // never remove more than 3 lines

    while (lines.length && removed < maxRemove) {
        const line = lines[0];

        // Skip empty lines
        if (!line) {
            lines.shift();
            continue;
        }

        // If it's a short AI-style opener sentence → remove whole line
        if (
            line.length < 200 &&
            openerPatterns.some(p => p.test(line))
        ) {
            lines.shift();
            removed++;
            continue;
        }

        break; // stop once real content starts
    }

    return lines.join("\n").trim();
}


// Trim Closures
function trimClosures(text) {
    if (!text || typeof text !== "string") return text;

    const singleLineClosers = [
        /(let me know|feel free to reach out|please don't hesitate)\b/i,
        /is there anything else\b/i,
        /i hope (this|that) (helps|was helpful|is useful)\b/i,
        /happy to help\b/i,
        /please let me know\b/i,
        /don't hesitate to ask\b/i,
        /(should|if) you (need|have) (any )?(further|more|additional)\b/i,
        /i'm here to help\b/i,
        /available for (questions|help)\b/i,
        /let me know what you think\b/i
    ];

    const blockStarters = [
        /^if you'd like,\s*i can also\b/i,
        /^if you'd like,\s*i can\b/i,
        /^i can also provide\b/i,
        /^i can also help\b/i,
        /^i can also share\b/i,
        /^would you like me to\b/i,
        /^i can help you with\b/i,
        /^here are a few (things|options) i can\b/i,
        /^you might also want\b/i
    ];

    const bulletLine = /^[•\-*]\s+/;

    let lines = text.trim().split("\n").map(l => l.trim());

    let cutoff = lines.length;

    // Walk from bottom upward
    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];

        if (!line) {
            cutoff = i;
            continue;
        }

        // Bullet list block
        if (bulletLine.test(line)) {
            cutoff = i;
            continue;
        }

        // Block starter
        if (blockStarters.some(p => p.test(line))) {
            cutoff = i;
            break;
        }

        // Single-line closer
        if (singleLineClosers.some(p => p.test(line)) && line.length < 200) {
            cutoff = i;
            continue;
        }

        // Stop once we hit real content
        break;
    }

    return lines.slice(0, cutoff).join("\n").trim();
}

function trimAIText(text) {
    return trimClosures(trimOpenings(text));
}


function cleanMarkdown(text) {
    return text
        // Remove bold syntax but keep the text: **text** → text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        // Remove italic syntax but keep the text: *text* → text
        .replace(/\*(.*?)\*/g, '$1')
        // Remove header syntax but keep the text: # Heading → Heading
        .replace(/^#{1,6}\s+/gm, '')
        // Remove inline code syntax but keep the text: `code` → code
        .replace(/`([^`]+)`/g, '$1')
        // Remove blockquote syntax but keep the text: > text → text
        .replace(/^>\s*/gm, '')
        // Remove horizontal rules completely
        .replace(/^[-*_]{3,}$/gm, '')
        // Keep list markers (they're useful formatting), just clean up spacing
        .replace(/^(\s*)[-*+]\s+/gm, '$1• ')
        .replace(/^(\s*)\d+\.\s+/gm, '$1')
        // Clean up excessive blank lines
        .replace(/\n{3,}/g, '\n\n');
}

function normalizeSpacing(text) {
    return text
        .replace(/[ \t]+/g, ' ')          // Multiple spaces/tabs to single space
        .replace(/\n{3,}/g, '\n\n')       // More than 2 newlines to 2
        .replace(/(\r\n|\r)/g, '\n')      // Normalize line endings
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        .trim();
}

function removeCliches(text) {
    const cliches = [
        /\b(In\s+conclusion\b,?)/gi,
        /\b(To\s+summarize\b,?)/gi,
        /\b(It'?s\s+worth\s+noting\s+(that)?)/gi,
        /\b(Furthermore\b,?)/gi,
        /\b(Additionally\b,?)/gi,
        /\b(Moreover\b,?)/gi,
        /\b(Ultimately\b,?)/gi,
        /\b(Tapestry\s+of\b)/gi,
        /\b(Navigating\s+(the|this)\b)/gi,
        /\b(In\s+today'?s\s+digital\s+age\b,?)/gi,
        /\b(At\s+the\s+end\s+of\s+the\s+day\b,?)/gi,
        /\b(As\s+previously\s+mentioned\b,?)/gi,
        /\b(Needless\s+to\s+say\b,?)/gi,
        /\b(It\s+goes\s+without\s+saying\b,?)/gi,
        /\b(Last\s+but\s+not\s+least\b,?)/gi,
        /\b(First\s+and\s+foremost\b,?)/gi,
        /\b(In\s+a\s+nutshell\b,?)/gi,
        /\b(When\s+it\s+comes\s+to\b)/gi,
        /\b(It'?s\s+important\s+to\s+note\b)/gi,
        /\b(The\s+bottom\s+line\s+is\b)/gi,
        /\b(As\s+a\s+result\b,?)/gi,
        /\b(Therefore\b,?)/gi,
        /\b(Hence\b,?)/gi,
        /\b(Thus\b,?)/gi,
        /\b(Consequently\b,?)/gi
    ];
    
    cliches.forEach(pattern => {
        text = text.replace(pattern, '');
    });
    
    return text;
}

function removeListNumbers(text) {
    // Remove numbered list markers (1., 2., 3., etc.)
    return text.replace(/^\d+[.)]\s+/gm, '');
}

function fixApostrophes(text) {
    // Convert smart quotes and apostrophes to straight ones
    return text
        .replace(/[\u2018\u2019]/g, "'")   // Smart single quotes
        .replace(/[\u201C\u201D]/g, '"')   // Smart double quotes
        .replace(/[\u2013\u2014]/g, '-');  // En/em dashes to hyphen
}