import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom';
import HikayeyiOkuModal from '../components/HikayeyiOkuModal'
import YapayZekaTestModal from '../components/yapayZekaTestModal'
import backgroundImage from "../assets/background2.jpg";
import { FaArrowLeft, FaCopy, FaChevronDown, FaChevronUp, FaPlay, FaStop, FaFileDownload, FaQuestionCircle } from 'react-icons/fa';

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
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [selectedTestStory, setSelectedTestStory] = useState(null);
    const [completedTests, setCompletedTests] = useState({});

    useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteStories') || '[]')
        setFavorites(savedFavorites)
    }, [])

    useEffect(() => {
        const savedCompletedTests = JSON.parse(localStorage.getItem('completedTests') || '{}');
        setCompletedTests(savedCompletedTests);
    }, []);

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

    const handleStartTest = (story, editedVersion = null) => {
        const testId = editedVersion ? `${story.id}_${editedVersion.id}` : `${story.id}_original`;

        if (completedTests[testId]) {
            alert('Bu test daha önce çözüldü!');
            return;
        }

        setSelectedTestStory({
            ...story,
            content: editedVersion ? editedVersion.response : story.content
        });

        const updatedCompletedTests = {
            ...completedTests,
            [testId]: true
        };
        setCompletedTests(updatedCompletedTests);

        localStorage.setItem('completedTests', JSON.stringify(updatedCompletedTests));

        setIsTestModalOpen(true);
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
            <div className="relative z-10 py-4 sm:py-8 px-2 sm:px-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-8 gap-4">
                        <h1 className="text-2xl sm:text-4xl font-bold font-vatena text-white text-center sm:text-left">
                            Favori Hikayelerim
                        </h1>
                        <button
                            onClick={() => navigate('/app')}
                            className="btn-primary bg-yellow-500 hover:bg-yellow-600 w-full sm:w-auto"
                        >
                            <FaArrowLeft className="w-5 h-5" />
                        </button>
                    </div>

                    {favorites.length === 0 ? (
                        <div className="card text-center py-8">
                            <p className="text-white">Henüz favori hikayen yok.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-6">
                            {favorites.map((story) => (
                                <div key={story.id} className="card p-3 sm:p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4">
                                        <div className="w-full sm:w-auto">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-2">
                                                {editingStoryId === story.id ? (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                                                        <input
                                                            type="text"
                                                            value={storyName}
                                                            onChange={(e) => setStoryName(e.target.value)}
                                                            placeholder="Hikaye adı girin..."
                                                            className="px-2 py-1 rounded-lg bg-white/90 text-gray-800 border-2 border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 w-full sm:w-auto"
                                                        />
                                                        <button
                                                            onClick={() => handleStoryNameSave(story.id)}
                                                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg w-full sm:w-auto mt-2 sm:mt-0"
                                                        >
                                                            Kaydet
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                                                        <span className="text-white text-lg font-semibold break-all">
                                                            {story.storyName ? ` ${story.storyName}` : ''}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                setEditingStoryId(story.id);
                                                                setStoryName(story.storyName || '');
                                                            }}
                                                            className="text-yellow-400 hover:text-yellow-500 text-sm w-full sm:w-auto"
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
                                            className="text-red-500 hover:text-red-600 sm:ml-auto"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <p className="text-white mb-4 break-words">
                                        {story.content.slice(0, 200)}...
                                    </p>

                                    {/* Düzenlenmiş Versiyonlar Bölümü */}
                                    {story.aiResponses && story.aiResponses.length > 0 && (
                                        <div className="mt-4 mb-4">
                                            <button
                                                onClick={() => toggleStoryChanges(story.id)}
                                                className="flex items-center gap-2 w-full text-left text-lg font-semibold text-white mb-2 hover:text-yellow-400 transition-colors"
                                            >
                                                <span className="flex-1">Hikayenin Düzenlenmiş Versiyonları</span>
                                                {expandedStories[story.id] ?
                                                    <FaChevronUp className="w-4 h-4" /> :
                                                    <FaChevronDown className="w-4 h-4" />
                                                }
                                                <span className="text-sm ml-2">({story.aiResponses.length})</span>
                                            </button>

                                            {expandedStories[story.id] && (
                                                <div className="space-y-2">
                                                    {story.aiResponses.map((response, index) => (
                                                        <div key={index} className="bg-white/10 rounded-lg p-3">
                                                            <p className="text-white break-words">
                                                                {response.response}
                                                            </p>
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2">
                                                                <p className="text-sm text-gray-300">
                                                                    {new Date(response.timestamp).toLocaleString('tr-TR')}
                                                                </p>
                                                                <div className="flex flex-wrap gap-2">
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
                                                                    <button
                                                                        onClick={() => handleStartTest(story, response)}
                                                                        className={`flex items-center gap-1 ${completedTests[`${story.id}_${response.id}`]
                                                                            ? 'text-gray-400 cursor-not-allowed'
                                                                            : 'text-yellow-400 hover:text-yellow-500 transition-colors'
                                                                            }`}
                                                                        disabled={completedTests[`${story.id}_${response.id}`]}
                                                                        title={
                                                                            completedTests[`${story.id}_${response.id}`]
                                                                                ? "Bu test daha önce çözüldü"
                                                                                : "Bu Versiyon İçin Test Başlat"
                                                                        }
                                                                    >
                                                                        <FaQuestionCircle className="w-4 h-4" />
                                                                        <span className="text-sm whitespace-nowrap">
                                                                            {completedTests[`${story.id}_${response.id}`]
                                                                                ? "Test Tamamlandı"
                                                                                : "Teste Başla"}
                                                                        </span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Alt Butonlar */}
                                    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
                                        <button
                                            onClick={() => handleCopyAndNavigate(story)}
                                            className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center gap-2"
                                        >
                                            <FaCopy className="w-5 h-5" />
                                            <span>Düzenle</span>
                                        </button>

                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <button
                                                onClick={() => handleStartTest(story)}
                                                className={`btn-primary flex items-center justify-center gap-2 ${completedTests[`${story.id}_original`]
                                                    ? 'bg-gray-500 cursor-not-allowed'
                                                    : 'bg-purple-500 hover:bg-purple-600'
                                                    }`}
                                                disabled={completedTests[`${story.id}_original`]}
                                            >
                                                <FaQuestionCircle className="w-5 h-5" />
                                                <span className="whitespace-nowrap">
                                                    {completedTests[`${story.id}_original`]
                                                        ? "Test Tamamlandı"
                                                        : "Teste Başla"}
                                                </span>
                                            </button>

                                            <button
                                                onClick={() => handleReadStory(story)}
                                                className="btn-primary bg-yellow-500 hover:bg-yellow-600 whitespace-nowrap"
                                            >
                                                Hikayeyi Oku
                                            </button>
                                        </div>
                                    </div>
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

                <YapayZekaTestModal
                    isOpen={isTestModalOpen}
                    onClose={() => {
                        setIsTestModalOpen(false);
                        setSelectedTestStory(null);
                    }}
                    story={selectedTestStory}
                />
            </div>
        </div>
    )
}

export default Favorites 