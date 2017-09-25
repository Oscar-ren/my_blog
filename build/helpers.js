import fs from 'fs';
import path from 'path';
import staticRender from './staticRender';

const defaultState = {
  posts: [],
  post: {},
  tags: [],
  archives: [],
  pages: 1,
  page: 1,
  commonTop: true
}

const publicPath = filename => path.resolve('public', `${filename}.html`);

export const generatePostsJson = (posts) => {
  fs.exists('data',function(exists){
      if(!exists)
          fs.mkdirSync('data')
      fs.writeFileSync('data/posts.json', JSON.stringify(posts, null, 2));
  })
}

export const copy = (src, dist) => {
  fs.createReadStream(src).pipe(fs.createWriteStream(dist));
}

export const generatePostPage = (post) => {
  const state = { ...defaultState, post };
  const { title, name } = post;
  const url = `/blog/${name}`;
  const htmlString = staticRender({ title, state, url });
  fs.writeFileSync(publicPath(name), htmlString);
}

export const getPostListFromTags = (posts) => {
  return posts.reduce((obj, post) => {
    post.tags.forEach((tag) => {
      if(obj[tag]) {
        obj[tag].push(post);
      }else {
        obj[tag] = [post];
      }
    })
    return obj;
  }, {});
}

export const getPostListFromDate = (posts) => {
  return posts.reduce((obj, post) => {
    const _date = post.date.match(/\d*-\d*/)[0];
    const {date, name, title} = post;
    !!obj[_date] ? obj[_date].push({date, name, title}) : obj[_date] = [{date, name, title}];
    return obj;
  }, {});
}

export const generateTagPage = (tags) => {
  const htmlString = staticRender({
    title: '分类 | 任祥磊的博客',
    state: { ...defaultState, tags },
    url: '/tags'
  });
  fs.writeFileSync(publicPath('tags'), htmlString);
}

export const generateDrawPage = (params) => {
  const htmlString = staticRender({
    title: '抽奖',
    state: {...defaultState, ...params},
    url: '/wanke/draw'
  });
  fs.writeFileSync(publicPath('draw'), htmlString);
}

export const generateArchivesPage = (archives) => {
  const htmlString = staticRender({
    title: '归档 | 任祥磊的博客',
    state: { ...defaultState, archives },
    url: '/archives'
  });
  fs.writeFileSync(publicPath('archives'), htmlString);
}

const generateAboutPage = () => {
  const htmlString = staticRender({
    state: {},
    title: "关于我",
    url: "/about"
  });
  fs.writeFileSync(publicPath("about"), htmlString);
}

export const generatePostListPage = (posts) => {
  const htmlString = staticRender({
    title: '任祥磊的博客',
    state: { ...defaultState, posts },
    url: '/'
  });
  fs.writeFileSync(publicPath('index'), htmlString);
}
