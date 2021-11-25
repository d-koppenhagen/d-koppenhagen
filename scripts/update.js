const { get } = require('https');
const { readFileSync, writeFileSync } = require('fs');
const { EOL } = require('os');
const { format } = require('prettier');
const { stripIndent } = require('common-tags');

const baseURL = 'https://k9n.dev';
const maxDisplay = 5;

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
    .filter(post => post.published)
    .reverse()
    .slice(0, maxDisplay)
    .forEach(post => {
      const displayThumb = post.thumbnail.card || post.thumbnail.header;
      const thumb = displayThumb.startsWith('http') ? displayThumb : `${baseURL}/${displayThumb}`;
      const data = stripIndent`
        <tr>
          <td>
            <h3>${post.language.toLowerCase() === 'de' ? ':de:' : ':us:'} ${post.title}</h3>
            <p>${post.description}</p>
            <a href="${baseURL}/${post.route}">:arrow_forward: Read more</a>
          </td>
          <td>
            <img src="${thumb}" alt="Banner" width="400px">
          </td>
        </tr>
      `;
      content += `${data}${EOL}${EOL}`;
    });

  const newReadme = baseReadme.replace('BLOG_POSTS_PLACEHOLDER', `<table>${content}</table>`);
  console.log(newReadme);
  const formatted = format(newReadme, {
    parser: 'markdown',
  });
  writeFileSync('./README.md', formatted);
}
