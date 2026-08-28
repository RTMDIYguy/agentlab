const fs = require('fs'); const data = JSON.parse(fs.readFileSync('audit.json')); const vulns = data.vulnerabilities || {}; Object.keys(vulns).forEach(k => console.log(k + ': ' + vulns[k].severity));
