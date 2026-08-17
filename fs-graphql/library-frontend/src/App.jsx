import { useState } from 'react'
import { useApolloClient, useQuery } from '@apollo/client/react'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Recommendations from './components/Recommendations'
import Login from './views/Login'
import { useSubscription } from '@apollo/client/react'

import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')

  const [token, setToken] = useState(
    localStorage.getItem('phonebook-user-token')
  )

  const [errorMessage, setErrorMessage] = useState(null)

  const client = useApolloClient()

  const authorsResult = useQuery(ALL_AUTHORS)
  const booksResult = useQuery(ALL_BOOKS)

  useSubscription(BOOK_ADDED, {
  onData: ({ data }) => {
    const book = data.data?.bookAdded

    if (book) {
      window.alert(`New book added: ${book.title}`)
    }
  },
})

  const notify = (message) => {
    setErrorMessage(message)

    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  if (authorsResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  if (authorsResult.error) {
    return <div>Error: {authorsResult.error.message}</div>
  }

  if (booksResult.error) {
    return <div>Error: {booksResult.error.message}</div>
  }

  return (
    <div>
     <div>
  <button onClick={() => setPage('authors')}>
    authors
  </button>

  <button onClick={() => setPage('books')}>
    books
  </button>

  {!token ? (
    <button onClick={() => setPage('login')}>
      login
    </button>
  ) : (
    <>
      <button onClick={() => setPage('add')}>
        add book
      </button>

      <button onClick={() => setPage('recommendations')}>
        recommend
      </button>

      <button onClick={logout}>
        logout
      </button>
    </>
  )}
  </div>
      {errorMessage && (
        <div style={{ color: 'red' }}>
          {errorMessage}
        </div>
      )}

      <Authors
  show={page === 'authors'}
  authors={authorsResult.data.allAuthors}
  token={token}
 />

  <Books show={page === 'books'} />

 <Recommendations
  show={page === 'recommendations'}
  />

  {page === 'add' && token && (
  <NewBook show={true} />
  )}

  {page === 'login' && !token && (
  <Login
    setError={notify}
    setToken={setToken}
  />
  )}
    </div>
  )
}

export default App