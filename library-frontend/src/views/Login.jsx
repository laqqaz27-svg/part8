import LoginForm from '../components/LoginForm'

const Login = ({ setError, setToken }) => {
  return (
    <div>
      <h2>login</h2>

      <LoginForm
        setError={setError}
        setToken={setToken}
      />
    </div>
  )
}

export default Login