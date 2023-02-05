import { MDXLayoutRenderer } from 'pliny/mdx-components'
import PageTitle from '@/components/PageTitle'
import { MDXComponents } from '@/components/MDXComponents'
import { sortedBlogPost, coreContent } from 'pliny/utils/contentlayer'
import { allBlogs, allAuthors } from 'contentlayer/generated'
const DEFAULT_LAYOUT = 'PostLayout'
export async function getStaticPaths() {
  return {
    paths: allBlogs.map((p) => ({
      params: {
        slug: p.slug.split('/'),
      },
    })),
    fallback: false,
  }
}
export const getStaticProps = async ({ params }) => {
  const slug = params.slug.join('/')
  const sortedPosts = sortedBlogPost(allBlogs)
  const postIndex = sortedPosts.findIndex((p) => p.slug === slug)
  const prevContent = getValidPrev(sortedPosts, postIndex)
  const nextContent = getValidNext(sortedPosts, postIndex)
  const prev = prevContent ? coreContent(prevContent) : null
  const next = nextContent ? coreContent(nextContent) : null
  const post = sortedPosts.find((p) => p.slug === slug)
  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults)
  })
  return {
    props: {
      post,
      authorDetails,
      prev,
      next,
    },
  }
}

const getValidPrev = (sortedPosts, postIndex) => {
  let i = 1
  let prevContent = sortedPosts[postIndex + i]
  while (prevContent && prevContent.draft) {
    i++
    prevContent = sortedPosts[postIndex + i]
  }

  return prevContent
}

const getValidNext = (sortedPosts, postIndex) => {
  let i = 1
  let nextContent = sortedPosts[postIndex - i]
  while (nextContent && nextContent.draft) {
    i++
    nextContent = sortedPosts[postIndex - i]
  }

  return nextContent
}

export default function BlogPostPage({ post, authorDetails, prev, next }) {
  return (
    <>
      {'draft' in post && post.draft === true ? (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      ) : (
        <MDXLayoutRenderer
          layout={post.layout || DEFAULT_LAYOUT}
          content={post}
          MDXComponents={MDXComponents}
          toc={post.toc}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        />
      )}
    </>
  )
}
