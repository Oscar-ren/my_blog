import fs from "fs";
import path from 'path';
import marked from 'marked';
import Prism from 'prismjs';
import * as helpers from './helpers';

marked.setOptions({
  highlight(code, lang) {
    return Prism.highlight(code, Prism.languages[lang]);
  }
});

const POST_DIR_PATH = path.resolve("posts");
const filenames = fs.readdirSync(POST_DIR_PATH);

const getPost = (filename, postStr) => {
  const matches = postStr.match(/---([\s\S]+)---\n+(#[^#\n.]*)\n+([\s\S]+)/m);
  const meta = JSON.parse(matches[1]);
  meta.title = matches[2].slice(2);
  const name = meta.date + "-" + path.basename(filename, '.md');

  const content = marked(matches[3]).replace(
    /<pre><code class="lang-(\w+)">/g,
    '<pre class="language-$1"><code class="language-$1">'
  );
  return {name, ...meta, content};
}

const readFileAsPromise = filename => new Promise((resolve, reject) => {
  fs.readFile(filename, 'utf-8', (err, str) => {
    if(err) {
      reject(err);
    }else {
      resolve(getPost(filename, str));
    }
  })
});


Promise.all(
  filenames.map(filename => readFileAsPromise(path.join(POST_DIR_PATH, filename)))
).then((posts) => {
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  helpers.generatePostsJson(posts);
  helpers.generatePostListPage(posts);
  posts.forEach(helpers.generatePostPage);

  helpers.generateTagPage(Object.entries(helpers.getPostListFromTags(posts)).sort());
  helpers.generateArchivesPage(Object.entries(helpers.getPostListFromDate(posts)));
}).catch((err) => {
  console.log("read file has an error: %s", err);
})

