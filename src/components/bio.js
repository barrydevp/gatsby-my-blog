/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import Image from "gatsby-image"

import { rhythm } from "../utils/typography"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/profile-pic.jpg/" }) {
        childImageSharp {
          fixed(width: 50, height: 50) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author
          birthday
          social {
            facebook
            github
          }
        }
      }
    }
  `)

  const { author, social, birthday } = data.site.siteMetadata
  return (
    <div
      style={{
        display: `flex`,
        marginBottom: rhythm(2.5),
      }}
    >
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author}
        style={{
          marginRight: rhythm(1 / 2),
          marginBottom: 0,
          minWidth: 50,
          borderRadius: `100%`,
        }}
        imgStyle={{
          borderRadius: `50%`,
        }}
      />
      <p>
      I'm <strong>{author}</strong> - <strong>{(new Date()).getFullYear() - (new Date(birthday)).getFullYear()}</strong> years old, student at University of Engineering & Technology.
        {` `}
        <a href={`${social.facebook}`}>
          Follow my Facebook
        </a>
        {` `}
        <a href={`${social.github}`}>
          and my Git.
        </a>
      </p>
    </div>
  )
}

export default Bio
