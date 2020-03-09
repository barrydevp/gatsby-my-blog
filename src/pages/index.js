import React from "react"
import { Link, graphql } from "gatsby"

import { rhythm } from "../utils/typography"
import { formatReadingTime } from "../utils/helpers"

import InfiniteScroll from "react-infinite-scroller"
import { Spin/* , Icon */ } from "antd"
import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

import 'antd/lib/spin/style/index.css'
// import 'antd/lib/icon/style/index.css'

class BlogIndex extends React.Component {
  postsPerLoad = 10

  state = {
    loadCount: 1,
    loading: false,
    hasMore: true,
  }

  handleInfiniteOnLoad = () => {
    const total = this.props.data.allMarkdownRemark.edges.length
    let { loadCount } = this.state

    if (loadCount < Math.ceil(total / this.postsPerLoad)) {
      this.setState({
        loading: true,
      })

      setTimeout(
        () =>
          this.setState({
            loadCount: ++loadCount,
            loading: false,
          }),
        1000
      )
    } else {
      this.setState({
        hasMore: false,
      })
    }
  }

  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    const posts = data.allMarkdownRemark.edges.filter(({node}) => (node.frontmatter && node.frontmatter.status === 'public')).slice(
      0,
      this.postsPerLoad * this.state.loadCount
    )
    // const antdIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="Barrydevp Blog" />
        <Bio />
        <InfiniteScroll
          // initialLoad={false}
          pageStart={0}
          loadMore={this.handleInfiniteOnLoad}
          hasMore={!this.state.loading && this.state.hasMore}
        >
          {posts.map(({ node }) => {
            const title = node.frontmatter.title || node.fields.slug
            return (
              <article key={node.fields.slug}>
                <header>
                  <h3
                    style={{
                      marginBottom: rhythm(1 / 4),
                    }}
                  >
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </h3>
                  <small>
                    {node.frontmatter.date}
                    {` • ${formatReadingTime(node.timeToRead)}`}
                  </small>
                </header>
                <section>
                  <p
                    dangerouslySetInnerHTML={{
                      __html: node.frontmatter.description || node.excerpt,
                    }}
                  />
                </section>
              </article>
            )
          })}
        </InfiniteScroll>

        {this.state.loading && this.state.hasMore && (
            <Spin />
        )}
        
        {this.props.data.allMarkdownRemark.totalCount >
          data.allMarkdownRemark.edges.length && (
          <Link to={`/pages/${this.state.loadCount + 1}`} rel="next">
            Loadmore →
          </Link>
        )}
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      skip: 0
      limit: 20
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          timeToRead
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
            status
          }
        }
      }
      totalCount
    }
  }
`
