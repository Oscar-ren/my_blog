'use strict';

import Component from 'inferno-component';
import { Link } from 'inferno-router';
import postListStyle from '../PostList/postlist.css';
import styles from './post.css';
import fecha from 'fecha';
// import 'github-markdown-css/github-markdown.css';

export default class Post extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if(typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    this.getPostData(this.props.params.name);
  }

  componentDidUpdate() {
    const {title} = this.props.post;
    if(title) {
      document.title = title;
    }
  }

  getPostData(name) {
    const { posts } = this.props;
    for(let i = 0; i < posts.length; i++) {
      if(posts[i].name === name) {
        this.props.update({post: posts[i]});
      }
    }
  }

  render() {
    const {origin, post} = this.props;

    return (
      <div>
        <article>
          <section className={postListStyle.meta}>
            <div className={postListStyle.date}>{post.date ? fecha.format(new Date(post.date), "MMM D, YYYY") : ''}</div>
            <div>
              {post.tags && post.tags.map(tag => (
                <Link className={postListStyle.tag} to={`/tags#${tag}`}>{tag}</Link>
              ))}
            </div>
          </section>
          <h1 className="title">{post.title}</h1>
          <div dangerouslySetInnerHTML={{__html: post.content}} />
          <div className="copyright_info">
            <p>本文链接：<a href={`${origin}/blog/${post.name}`} target="_blank">{`${origin}/blog/${post.name}`}</a></p>
            <p>本站使用<a href="http://creativecommons.org/licenses/by/4.0/deed.zh" target="_blank">「署名 4.0 国际」</a>创作共享协议</p>
          </div>
        </article>
      </div>
    )
  }
}

Post.defaultProps = {

}