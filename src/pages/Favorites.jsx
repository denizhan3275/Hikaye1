import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import HikayeyiOkuModal from '../components/HikayeyiOkuModal'
import backgroundImage from "../assets/background2.jpg";
import { FaArrowLeft, FaCopy, FaChevronDown, FaChevronUp, FaPlay, FaStop, FaFileDownload } from 'react-icons/fa';

function Favorites() {
    const [favorites, setFavorites] = useState([])
    const [selectedStory, setSelectedStory] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [copySuccess, setCopySuccess] = useState('')
    const [expandedStories, setExpandedStories] = useState({})
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [currentSpeakingId, setCurrentSpeakingId] = useState(null)
    const synthRef = useRef(window.speechSynthesis)
    const navigate = useNavigate();
    const [editingStoryId, setEditingStoryId] = useState(null);
    const [storyName, setStoryName] = useState('');

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteStories') || '[]')
        setFavorites(savedFavorites)
    }, [])

    const removeFavorite = (id) => {
        const updatedFavorites = favorites.filter(story => story.id !== id)
        localStorage.setItem('favoriteStories', JSON.stringify(updatedFavorites))
        setFavorites(updatedFavorites)
    }

    const handleReadStory = (story) => {
        setSelectedStory(story)
        setIsModalOpen(true)
    }

    const handleCopyAndNavigate = async (story) => {
        try {
            await navigator.clipboard.writeText(story.content);


            setTimeout(() => {
                navigate('/chat', {
                    state: { story: story.content }
                });
            }, 1000);
        } catch (err) {
            setCopySuccess('Kopyalama başarısız!');
        }
    };

    const toggleStoryChanges = (storyId) => {
        setExpandedStories(prev => ({
            ...prev,
            [storyId]: !prev[storyId]
        }));
    };

    // Sesli okuma fonksiyonu
    const speak = (text, responseId) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.onend = () => {
            setIsSpeaking(false);
            setCurrentSpeakingId(null);
        };
        setIsSpeaking(true);
        setCurrentSpeakingId(responseId);
        synthRef.current.speak(utterance);
    };

    // PDF indirme fonksiyonu
    const handleDownloadPDF = (text) => {
        try {
            const element = document.createElement('a');
            const file = new Blob([text], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = 'duzenlenmis-hikaye.txt';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (error) {
            console.error('Dosya indirme hatası:', error);
            alert('Dosya indirilirken bir hata oluştu');
        }
    };

    const handleStoryNameSave = (storyId) => {
        const updatedFavorites = favorites.map(story => {
            if (story.id === storyId) {
                return { ...story, storyName: storyName };
            }
            return story;
        });
        localStorage.setItem('favoriteStories', JSON.stringify(updatedFavorites));
        setFavorites(updatedFavorites);
        setEditingStoryId(null);
        setStoryName('');
    };

    return (
        <div className="relative min-h-screen">
            {/* Arka plan resmi */}
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
                    // zIndex: 0,
                    opacity: 2
                }}
            />


            {/* İçerik */}
            <div className="relative z-10  py-8 px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold font-vatena text-white">
                            Favori Hikayelerim
                        </h1>
                        <button
                            onClick={() => navigate('/app')}
                            className="btn-primary bg-yellow-500 hover:bg-yellow-600"
                        >
                            <FaArrowLeft className="w-6 h-6" />
                        </button>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-white]">Henüz favori hikayen yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {favorites.map((story) => (
                                <div key={story.id} className="card">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">

                                                {editingStoryId === story.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            value={storyName}
                                                            onChange={(e) => setStoryName(e.target.value)}
                                                            placeholder="Hikaye adı girin..."
                                                            className="px-2 py-1 rounded-lg bg-white/90 text-gray-800 border-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                        />
                                                        <button
                                                            onClick={() => handleStoryNameSave(story.id)}
                                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                                                        >
                                                            Kaydet
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white text-lg font-semibold ">
                                                            {story.storyName ? ` ${story.storyName}` : ''}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingStoryId(story.id);
                                                                setStoryName(story.storyName || '');
                                                            }}
                                                            className="text-yellow-400 hover:text-yellow-500 text-sm"
                                                        >
                                                            {story.storyName ? 'Adı Düzenle' : 'Ad Ver'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-white">
                                                Oluşturulma: {new Date(story.createdAt).toLocaleDateString('tr-TR')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => removeFavorite(story.id)}
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="text-white mb-4">
                                        {story.content.slice(0, 200)}...
                                    </p>
                                    {story.aiResponses && story.aiResponses.length > 0 && (
                                        <div className="mt-4 mb-4">
                                            <button
                                                onClick={() => toggleStoryChanges(story.id)}
                                                className="flex items-center gap-2 w-full text-left text-lg font-semibold text-white mb-2 hover:text-yellow-400 transition-colors"
                                            >
                                                <span>Hikayenin Düzenlenmiş Versiyonları</span>
                                                {expandedStories[story.id] ?
                                                    <FaChevronUp className="w-4 h-4" /> :
                                                    <FaChevronDown className="w-4 h-4" />
                                                }
                                                <span className="text-sm ml-2">({story.aiResponses.length})</span>
                                            </button>
                                            {expandedStories[story.id] && (
                                                <div className="space-y-2">
                                                    {story.aiResponses.map((response, index) => (
                                                        <div key={index} className="bg-white/10 rounded-lg p-3 mb-2">
                                                            <p className="text-white">
                                                                {response.response}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-3">
                                                                <p className="text-sm text-gray-300">
                                                                    {new Date(response.timestamp).toLocaleString('tr-TR')}
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => speak(response.response, index)}
                                                                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                                                                        title={isSpeaking && currentSpeakingId === index ? "Sesi Durdur" : "Sesli Dinle"}
                                                                    >
                                                                        {isSpeaking && currentSpeakingId === index ?
                                                                            <FaStop className="w-4 h-4" /> :
                                                                            <FaPlay className="w-4 h-4" />
                                                                        }
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDownloadPDF(response.response)}
                                                                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                                                                        title="Metni İndir"
                                                                    >
                                                                        <FaFileDownload className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center gap-2">
                                        <button
                                            onClick={() => handleCopyAndNavigate(story)}
                                            className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center gap-2"
                                        >
                                            <FaCopy className="w-5 h-5" />
                                            <span>Düzenle</span>
                                        </button>

                                        <button
                                            onClick={() => handleReadStory(story)}
                                            className="btn-primary bg-yellow-500 hover:bg-yellow-600"
                                        >
                                            Hikayeyi Oku
                                        </button>
                                    </div>
                                    {copySuccess && (
                                        <div className="mt-2 text-center text-green-600 font-medium">
                                            {copySuccess}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <HikayeyiOkuModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    story={selectedStory}
                />
            </div>
        </div>
    )
}

export default Favorites 