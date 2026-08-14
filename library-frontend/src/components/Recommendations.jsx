import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ME } from '../queries'

const Recommendations = ({ show }) => {
  const meResult = useQuery(ME)

  if (!show) {
    return null
  }

  if (meResult.loading) {
    return <div>loading...</div>
  }

  if (meResult.error) {
    return <div>Error: {meResult.error.message}</div>
  }

  if (!meResult.data.me) {
    return <div>user not logged in</div>
  }

  const favoriteGenre = meResult.data.me.favoriteGenre

  return (
    <RecommendationBooks genre={favoriteGenre} />
  )
}

const RecommendationBooks = ({ genre }) => {
  const result = useQuery(ALL_BOOKS, {
    variables: {
      genre,
    },
  })

  if (result.loading) {
    return <div>loading...</div>
  }

  if (result.error) {
    return <div>Error: {result.error.message}</div>
  }

  const books = result.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <b>{genre}</b>
      </p>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations