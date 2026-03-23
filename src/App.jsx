import { useState } from 'react'
import './App.css'
import TransitGraph from './ui/TransitGraph.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TransitGraph />
    </>
  )
}

export default App
