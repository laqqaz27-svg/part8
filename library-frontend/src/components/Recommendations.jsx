import { useQuery } from '@apollo/client/react'

import { ME, ALL_BOOKS } from '../queries'

const Recommendations = ({ show }) => {
  const meResult = useQuery(ME, {
    skip: !show,
  })

  const favoriteGenre = meResult.data?.me?.favoriteGenre

  const booksResult = useQuery(ALL_BOOKS, {
    variables: {
      genre: favoriteGenre,
    },
    skip: !show || !favoriteGenre,
  })

  if (!show) {
    return null
  }

  if (meResult.loading) {
    return <div>loading...</div>
  }

  if (meResult.error) {
    return <div>Error: {meResult.error.message}</div>
  }

  if (!favoriteGenre) {
    return <div>No favorite genre found</div>
  }

  if (booksResult.loading) {
    return <div>loading...</div>
  }

  if (booksResult.error) {
    return <div>Error: {booksResult.error.message}</div>
  }

  const books = booksResult.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>

      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>

      <table>
        <tbody>
          <tr>
            <th>title</th>
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