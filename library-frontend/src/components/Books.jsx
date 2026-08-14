import { useState } from 'react'

const Books = ({ show, books }) => {
  const [genre, setGenre] = useState('patterns')

  if (!show) {
    return null
  }

  const filteredBooks = genre
    ? books.filter(book => book.genres.includes(genre))
    : books

  const genres = [
    'refactoring',
    'agile',
    'patterns',
    'design',
    'crime',
    'classic'
  ]

  return (
    <div>
      <h2>books</h2>

      <div>
        in genre <b>{genre}</b>
      </div>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>

          {filteredBooks.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {genres.map(g => (
        <button
          key={g}
          onClick={() => setGenre(g)}
        >
          {g}
        </button>
      ))}

      <button onClick={() => setGenre(null)}>
        all genres
      </button>
    </div>
  )
}

export default Books