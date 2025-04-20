import { useState } from 'react'
import Modal from './Modal'

function StoryDisplay({ story, character }) {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const addToFavorites = () => {
        const newFavorite = {
            id: Date.now(),
            content: story,
            character: character,
            createdAt: new Date().toISOString()
        }

        const favorites = JSON.parse(localStorage.getItem('favoriteStories') || '[]')
        localStorage.setItem('favoriteStories', JSON.stringify([...favorites, newFavorite]))
        alert('Hikaye favorilere eklendi!')
    }

    const handleSpeak = () => {
        if (!story) return

        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }

        const utterance = new SpeechSynthesisUtterance(story)
        utterance.lang = 'tr-TR'
        utterance.onend = () => setIsSpeaking(false)
        window.speechSynthesis.speak(utterance)
        setIsSpeaking(true)
    }

    const handleDownloadPDF = () => {
        try {
            // Hikayeyi text dosyası olarak indir
            const element = document.createElement('a');
            const file = new Blob([story], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = 'cocuk-hikayesi.txt';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (error) {
            console.error('Dosya indirme hatası:', error);
            alert('Dosya indirilirken bir hata oluştu');
        }
    }

    if (!story) {
        return (
            <div className="card max-w-2xl mx-auto my-8">
                <p className="text-white text-center ">
                    Henüz bir hikaye oluşturulmadı. Yukarıdaki seçenekleri kullanarak yeni bir hikaye oluşturabilirsiniz.
                </p>
            </div>
        )
    }

    // Hikayenin ilk 200 karakterini göster
    const previewText = story.slice(0, 200) + (story.length > 200 ? '...' : '');

    return (
        <div className="max-w-2xl mx-auto my-8">
            <div className="card">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">
                        {character} Hikaye
                    </h2>
                    <div className="space-x-4">
                        <button
                            onClick={addToFavorites}
                            className="btn-primary bg-yellow-500 hover:bg-yellow-600"
                            title="Favorilere Ekle"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="btn-primary bg-green-500 hover:bg-green-600"
                        >
                            Hikayeyi Gör
                        </button>
                        <button
                            onClick={handleSpeak}
                            className={`btn-primary ${isSpeaking ? 'bg-red-500 hover:bg-red-600' : ''
                                }`}
                        >
                            {isSpeaking ? 'Durdur' : 'Sesli Dinle'}
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="btn-primary bg-blue-500 hover:bg-blue-600"
                        >
                            PDF İndir
                        </button>
                    </div>
                </div>

                {/* Hikaye Önizlemesi */}
                <div className="prose max-w-none">
                    <p className="text-white leading-relaxed">
                        {previewText}
                    </p>
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            >
                {story.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                    </p>
                ))}
            </Modal>
        </div>
    )
}

export default StoryDisplay 