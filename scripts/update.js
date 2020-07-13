const { get } = require('https');
const { readFileSync, writeFileSync } = require('fs');
const { EOL } = require('os');
const { format } = require('prettier');
const { stripIndent } = require('common-tags');

const baseURL = 'https://d-koppenhagen.de';
const maxDisplay = 3;

get(`${baseURL}/assets/scully-routes.json`, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    updateReadme(JSON.parse(data));
  });
}).on('error', (e) => {
  console.error(e);
});

function updateReadme(posts) {
  const baseReadme = readFileSync('./README.base.md', { encoding:'utf8', flag:'r' }); 
  let content = '';

  posts
    .filter(post => post.route.startsWith('/blog/'))
    .reverse()
    .slice(0, maxDisplay)
    .forEach(post => {
      const data = stripIndent`
        ### ${post.language.toLowerCase() === 'de' ? ':de:' : ':us:'} ${post.title}
        
        ![Banner](${baseURL}/${post.thumbnailSmall})

        ${post.description}

        [Read more](${baseURL}/${post.route})
      `;
      content += `${data}${EOL}${EOL}`;
    });

  const newReadme = baseReadme.replace('BLOG_POSTS_PLACEHOLDER', content);
  console.log(newReadme);
  const formatted = format(newReadme, {
    parser: 'markdown',
  });
  writeFileSync('./README.md', formatted);
}