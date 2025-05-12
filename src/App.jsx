import { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

function Header() {
  return (
    <header className='bg-black text-white py-4 w-full text-center shadow-md'>
      <h1 className='text-3xl font-bold'>Isa AI Chat</h1>
    </header>
  )
}

function Navbar() {
  return (
    <nav className='bg-black text-white px-6 py-2 w-full shadow'>
      <ul className='flex gap-4 justify-center'>
        <li className='hover:underline cursor-pointer'>Главная</li>
        <li className='hover:underline cursor-pointer'>История</li>
        <li className='hover:underline cursor-pointer'>О проекте</li>
      </ul>
    </nav>
  )
}

function Main({ prompt, setPrompt, handleSubmit, response, loading, history }) {
  return (
    <main className='flex flex-col items-center w-full p-6 bg-gray-100 flex-grow'>
      <div className='flex gap-2 mb-4 w-full max-w-xl'>
        <input
          type='text'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Введите вопрос...'
          className='border p-2 rounded-md flex-grow'
        />
        <button
          onClick={handleSubmit}
          className='bg-black text-white p-2 rounded-md'
        >
          Отправить
        </button>
      </div>

      {loading ? (
        <div className='mt-4'>Загружаю ответ...</div>
      ) : (
        response && (
          <div className='p-3 max-w-2xl bg-gray-700 text-white rounded-md mt-2'>
            {response}
          </div>
        )
      )}

      <div className='w-full max-w-2xl mt-6'>
        <h2 className='text-xl font-semibold mb-2'>История:</h2>
        <ul className='space-y-4'>
          {history.map((item, index) => (
            <li key={index} className='bg-white p-3 rounded-md shadow'>
              <p><strong>Вопрос:</strong> {item.prompt}</p  >
              <p><strong>Ответ:</strong> {item.response}</p>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

function Footer() {
  return (
    <footer className='bg-black text-white py-4 w-full text-center mt-auto'>
      <p>2025 Isa AI Chat. Все права защищены.</p>
    </footer>
  )
}

function App() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('geminiHistory')) || []
    setHistory(savedHistory)
  }, [])

  const handleSubmit = async () => {
    if (!prompt.trim()) return
    try {
      setLoading(true)
      setResponse('')
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      const result = await model.generateContent(prompt)
      const geminiResponse = await result.response
      const text = await geminiResponse.text()

      setResponse(text)

      const newEntry = { prompt, response: text }
      const updatedHistory = [newEntry, ...history]
      setHistory(updatedHistory)
      localStorage.setItem('geminiHistory', JSON.stringify(updatedHistory))
    } catch (err) {
      console.error('Ошибка при запросе к Gemini:', err)
      setResponse('Произошла ошибка. Проверь API-ключ и регион.')
    } finally {
      setLoading(false)
      setPrompt('')
    }
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <Navbar />
      <Main
        prompt={prompt}
        setPrompt={setPrompt}
        handleSubmit={handleSubmit}
        response={response}
        loading={loading}
        history={history}
      />
      <Footer />
    </div>
  )
}

export default App
