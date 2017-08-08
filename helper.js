const fs = require('fs');
const path = require('path');

const getData = (filename) => {
  return JSON.parse(fs.readFileSync(path.resolve('data', filename)));
}

const posts = getData('posts.json');

exports.getPosts = (page, tag) => {
  return posts;
}

exports.getTagsData = () => {
  return posts.reduce((obj, post) => {
    post.tags.forEach((tag) => {
      const {name, title, date} = post;
      if(obj[tag]) {
        obj[tag].push({name, title, date});
      }else {
        obj[tag] = [{name, title, date}];
      }
    })
    return obj;
  }, {});
};

exports.getPostListFromDate = () => {
  return posts.reduce((obj, post) => {
    const _date = post.date.match(/\d*-\d*/)[0];
    const {date, name, title} = post;
    !!obj[_date] ? obj[_date].push({date, name, title}) : obj[_date] = [{date, name, title}];
    return obj;
  }, {});
}

exports.getPost = (name) => {
  return posts.find(post => post.name === name);
}
