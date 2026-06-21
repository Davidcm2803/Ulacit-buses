import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './index.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h2 className="bg-red-500 text-white text-4xl font-bold p-6 text-center rounded-xl mt-10">
        Test plugin tailwind
      </h2> 
    </>
  )
}

export default App