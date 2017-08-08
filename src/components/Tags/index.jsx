import Component from 'inferno-component';
import { Link } from 'inferno-router';
import styles from './tags.css'

export default class Tags extends Component {
  constructor(prop) {
    super(prop);
    this.getTagsData = this.getTagsData.bind(this);
  }

  componentDidMount() {
    this.getTagsData();
    document.title = "分类 | 任祥磊的博客";
  }

  getTagsData() {
    fetch(`/json/tags`)
      .then(res => res.json())
      .then(data => {
        this.props.update(data);
      })
      .catch(err => {
        console.log(err);
      })
  }

  render() {
    const {tags} = this.props;

    return (
      <div>
        <article>
          <h1 className="title">分类</h1>
          {tags.map(tag => (
            <div>
              <h2 id={`#${tag[0]}`}>{tag[0]}</h2>
              <ul>
                {tag[1].map(post => (
                  <li><Link to={`/blog/${post.name}`}>{post.title}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      </div>

    )
  }
}