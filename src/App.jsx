import { useState, useRef } from 'react'
import './index.css'
import { generateStory } from './services/api'
import StoryDisplay from './components/StoryDisplay'
import { FaMicrophone, FaMicrophoneSlash, FaStar, FaArrowLeft } from 'react-icons/fa'

import backgroundImage from "./assets/background.jpg";


function App() {
  const [storyPrompt, setStoryPrompt] = useState('')
  const [selectedCharacters, setSelectedCharacters] = useState([])
  const [customCharacter, setCustomCharacter] = useState('')
  const [storyLength, setStoryLength] = useState('medium')
  const [languageLevel, setLanguageLevel] = useState('simple')
  const [generatedStory, setGeneratedStory] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [characterError, setCharacterError] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const [characters, setCharacters] = useState([
    'Kedi', 'Ejderha', 'Çocuk', 'Uzay Gemisi',
    'Süper Kahraman', 'Sihirli Unicorn', 'Robot',
    'Deniz Kızı', 'Küçük Bilim İnsanı', 'Cesur Şövalye'
  ])







  const handleGenerateStory = async () => {
    if (selectedCharacters.length === 0) {
      setCharacterError(true)
      alert('Lütfen en az bir karakter seçin!')
      return
    }

    if (!storyPrompt) {
      alert('Lütfen bir hikaye konusu girin')
      return
    }

    try {
      setError(null)
      setIsLoading(true)
      console.log('Hikaye oluşturma isteği gönderiliyor...')

      const story = await generateStory(
        storyPrompt,
        selectedCharacters.join(', '),
        storyLength,
        languageLevel
      )

      console.log('Hikaye başarıyla oluşturuldu')
      setGeneratedStory(story)
    } catch (error) {
      console.error('Hata detayı:', error)
      setError(
        `Hikaye oluşturulurken bir hata oluştu: ${error.message.includes('API')
          ? 'Sunucu yanıt vermedi, lütfen biraz bekleyip tekrar deneyin.'
          : 'Lütfen tekrar deneyin.'
        }`
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Ses tanıma fonksiyonunu ekleyelim
  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'tr-TR'

      recognitionRef.current.onstart = () => {
        setIsListening(true)
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')

        setStoryPrompt(transcript)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Ses tanıma hatası:', event.error)
        setError('Ses tanıma sırasında bir hata oluştu.')
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current.start()
    } else {
      setError('Tarayıcınız ses tanıma özelliğini desteklemiyor.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleCharacterToggle = (character) => {
    if (selectedCharacters.includes(character)) {
      setSelectedCharacters(selectedCharacters.filter(char => char !== character))
    } else {
      setSelectedCharacters([...selectedCharacters, character])
    }
  }

  return (
    <div className="relative min-h-screen">
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // zIndex: -1,
          opacity: 2
        }}
      />
      <div className="relative z-10  py-8 px-4">
        <div className="max-w-3xl mx-auto ">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => window.location.href = '/'}
              className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center"
            >
              <FaArrowLeft className="w-10 h-5" />
            </button>
            <button
              onClick={() => window.location.href = '/favorites'}
              className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center"
            >
              <FaStar className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Hikaye Prompt Alanı */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-center  text-white">
                Hikaye konusu girin?
              </h2>
              <div className="relative">
                <textarea
                  className="input-area pr-12 text-center  "
                  rows="4"
                  value={storyPrompt}
                  onChange={(e) => setStoryPrompt(e.target.value)}
                  placeholder="Örnek:Yerlere çöp atmanın yanlış bir davranış olduğu..."
                />
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute right-2 top-2 p-2 rounded-full ${isListening ? "bg-red-500" : 'bg-blue-500'
                    } text-white hover:opacity-80 transition-opacity`}
                  title={isListening ? 'Kaydı Durdur' : 'Sesli Anlatım Başlat'}
                >
                  {isListening ? <FaMicrophoneSlash className="w-5 h-5" /> : <FaMicrophone className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Karakter Seçimi */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-center text-white">Karakterleri Seç</h2>
              <div className="mb-6">

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {characters.map((char) => (
                    <button
                      key={char}
                      className={`character-btn ${selectedCharacters.includes(char)
                        ? 'bg-yellow-500 text-white'
                        : 'text-[hsla(42,72%,47%,1)]'
                        } p-2 rounded-lg border-2 border-[hsla(42,72%,47%,1)] hover:bg-yellow-400 hover:text-white transition-colors`}
                      onClick={() => handleCharacterToggle(char)}
                    >
                      {char}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={customCharacter}
                    onChange={(e) => setCustomCharacter(e.target.value)}
                    placeholder="Özel karakter ekle..."
                    className="flex-1 p-2 rounded-lg border-2 border-[hsla(42,72%,47%,1)] focus:outline-none focus:border-yellow-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && customCharacter.trim()) {
                        setCharacters([...characters, customCharacter.trim()]);
                        handleCharacterToggle(customCharacter.trim());
                        setCustomCharacter('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (customCharacter.trim()) {
                        setCharacters([...characters, customCharacter.trim()]);
                        handleCharacterToggle(customCharacter.trim());
                        setCustomCharacter('');
                      }
                    }}
                    className="px-4 py-2 bg-[hsla(42,72%,47%,1)] text-white rounded-lg hover:bg-yellow-500 transition-colors"
                  >
                    Ekle
                  </button>
                </div>
                {characterError && (
                  <p className="text-red-500 mt-2">Lütfen en az bir karakter seçin!</p>
                )}
              </div>
            </div>

            {/* Hikaye Ayarları */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-center text-white">Hikaye Ayarları</h2>

              <div className="space-y-4">
                {/* Hikaye Uzunluğu */}
                <div>
                  <h3 className="font-medium mb-2 text-white ">Hikaye Uzunluğu</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: 'short', label: 'Kısa' },
                      { id: 'medium', label: 'Orta' },
                      { id: 'long', label: 'Uzun' }
                    ].map((length) => (
                      <button
                        key={length.id}
                        className={`character-btn ${storyLength === length.id ? 'bg-yellow-500 text-white' : 'text-[hsla(42,72%,47%,1)]'
                          }`}
                        onClick={() => setStoryLength(length.id)}
                      >
                        {length.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dil Seviyesi */}
                <div>
                  <h3 className="font-medium mb-2 text-white" >Dil Seviyesi</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'simple', label: 'Basit' },
                      { id: 'advanced', label: 'İleri' }
                    ].map((level) => (
                      <button
                        key={level.id}
                        className={`character-btn ${languageLevel === level.id ? 'bg-yellow-500 text-white' : 'text-[hsla(42,72%,47%,1)]'
                          }`}
                        onClick={() => setLanguageLevel(level.id)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hata ve Loading mesajları */}
            {error && (
              <div className="card text-red-500">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="card text-white">
                Hikaye oluşturuluyor...
              </div>
            )}

            {/* Hikaye Oluştur Butonu */}
            <button
              className=" btn-primary w-full py-3 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-white"
              onClick={handleGenerateStory}
              disabled={isLoading}
            >
              {isLoading ? 'Hikaye Oluşturuluyor...' : 'Hikaye Oluştur'}
            </button>

            {/* StoryDisplay bileşeni */}
            <StoryDisplay story={generatedStory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
