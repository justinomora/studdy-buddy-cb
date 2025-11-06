import { Chat } from './components/Chat'
import { Context } from './components/Context'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <div className="main-content">
        <Chat />
      </div>
      <div className="sidebar">
        <Context />
      </div>
    </div>
  )
}

export default App
