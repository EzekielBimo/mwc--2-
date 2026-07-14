const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'public', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Replace style tags
const styleRegex = /<style>[\s\S]*?<\/style>/;
html = html.replace(styleRegex, '<link rel="stylesheet" href="style.css" />');

// Replace script tags
const scriptRegex = /<script>[\s\S]*?<\/script>/;
const scriptRepl = `
<script src="app.js"></script>
<script src="dashboard.js"></script>
<script src="subjects.js"></script>
<script src="sessions.js"></script>
`;
html = html.replace(scriptRegex, scriptRepl.trim());

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully refactored index.html');
