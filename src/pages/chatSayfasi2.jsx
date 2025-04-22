import React, { memo, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMicrophone, FaMicrophoneSlash, FaPlay, FaStop, FaStar } from 'react-icons/fa';
import backgroundImage from "../assets/background2.jpg";
import { generateChatResponse } from '../services/api';

export default function ChatSayfasi2() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const messageEndRef = useRef(null);
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const navigate = useNavigate();


    const addToFavorites = (text) => {
        try {
            const newFavorite = {
                id: Date.now(),
                content: text,
                character: 'AI Cevabı',
                storyName: 'AI Cevabı - ' + new Date().toLocaleString('tr-TR'),
                createdAt: new Date().toISOString()
            };

            const favorites = JSON.parse(localStorage.getItem('favoriteStories') || '[]');
            localStorage.setItem('favoriteStories', JSON.stringify([...favorites, newFavorite]));
            alert('Cevap favorilere eklendi!');
        } catch (error) {
            console.error('Favorilere ekleme hatası:', error);
            alert('Favorilere eklenirken bir hata oluştu');
        }
    };

    // Otomatik scroll için useEffect
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Component mount olduğunda hoşgeldin mesajı
    useEffect(() => {
        const sendWelcomeMessage = async () => {
            try {
                setIsTyping(true);
                const welcomeResponse = await generateChatResponse(
                    "Merhaba! Aklındaki hikayeyi anlatmak için hazırım. Nasıl bir hikaye düşünüyorsun?"
                );
                setMessages([{
                    id: new Date().getTime(),
                    type: 'receive',
                    text: welcomeResponse
                }]);
            } catch (err) {
                setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
            } finally {
                setIsTyping(false);
            }
        };

        sendWelcomeMessage();

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // Ses tanıma için useEffect
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'tr-TR';

            recognition.onresult = (event) => {
                const lastResult = event.results[event.results.length - 1];
                if (lastResult.isFinal) {
                    const transcript = lastResult[0].transcript;
                    setMessage(prev => prev + ' ' + transcript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Ses tanıma hatası:', event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            if (synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    // Metni sesli oku
    const speak = (text) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.pitch = 1.0; // Ses perdesi (0.1 ile 2 arası)
        utterance.rate = 1.0; // Konuşma hızı (0.1 ile 10 arası)
        utterance.volume = 1.0; // Ses seviyesi (0 ile 1 arası)

        // Türkçe kadın sesi için
        const voices = window.speechSynthesis.getVoices();
        const turkishVoice = voices.find(voice => voice.lang.includes('tr-TR') && voice.name.includes('Female'));
        if (turkishVoice) {
            utterance.voice = turkishVoice;
        }

        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        synthRef.current.speak(utterance);
    };

    // Sesleri yüklemek için useEffect
    useEffect(() => {
        const loadVoices = () => {
            window.speechSynthesis.getVoices();
        };

        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setMessage('');
        }
        setIsListening(!isListening);
    };

    const sendMsg = async () => {
        if (message.trim()) {
            const userMessage = {
                id: new Date().getTime(),
                type: 'send',
                text: message
            };

            setMessages(prev => [userMessage, ...prev]);
            setMessage('');
            setIsTyping(true);
            setError(null);

            try {
                const response = await generateChatResponse(message);
                setMessages(prev => [{
                    id: new Date().getTime(),
                    type: 'receive',
                    text: response
                }, ...prev]);
            } catch (err) {
                setError("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
                console.error(err);
            } finally {
                setIsTyping(false);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMsg();
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Arka plan */}
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
                    opacity: 2
                }}
            />

            {/* İçerik */}
            <div className="relative z-10 flex flex-col h-screen">
                {/* Header */}
                <div className="bg-white/60 backdrop-blur-sm p-4 shadow-md">
                    <div className="max-w-3xl mx-auto w-full flex items-center justify-between px-4">
                        <button
                            onClick={() => navigate('/')}
                            className="btn-primary mx-0 bg-yellow-500 hover:bg-yellow-600"
                        >
                            <FaArrowLeft className="w-6 h-4 sm:w-8 sm:h-6" />
                        </button>
                        <button
                            onClick={() => window.location.href = '/favorites'}
                            className="btn-primary bg-yellow-500 hover:bg-yellow-600 flex items-center"
                        >
                            <FaStar className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                    <div ref={messageEndRef} />
                    {messages.map((item) => (
                        <div key={item.id} className={`mb-2 ${item.type === 'send' ? 'ml-auto' : 'mr-auto'}`}>
                            <div className={`rounded-lg px-2 sm:px-4 py-2 max-w-[85%] sm:max-w-[75%] flex flex-wrap sm:flex-nowrap items-center gap-2 ${item.type === 'send'
                                ? 'bg-yellow-500 text-white mr-4 sm:mr-8'
                                : 'bg-white/90 backdrop-blur-sm ml-4 sm:ml-8 text-[hsla(42,72%,47%,1)]'
                                }`}>
                                <span className="w-full sm:w-auto break-words">{item.text}</span>
                                {item.type === 'receive' && (
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start mt-2 sm:mt-0">
                                        <button
                                            onClick={() => speak(item.text)}
                                            className="text-yellow-600 hover:text-yellow-700"
                                            title={isSpeaking ? "Sesi Durdur" : "Sesli Dinle"}
                                        >
                                            {isSpeaking ? <FaStop className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => addToFavorites(item.text)}
                                            className="text-yellow-600 hover:text-yellow-700"
                                            title="Favorilere Ekle"
                                        >
                                            <FaStar className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="mb-2 mr-auto">
                            <div className="bg-gray-200 text-gray-800 rounded-lg px-2 sm:px-4 py-2 ml-4 sm:ml-8">
                                Yazıyor...
                            </div>
                        </div>
                    )}
                </div>

                {/* Mesaj gönderme alanı */}
                <div className="bg-white/80 backdrop-blur-sm p-2 sm:p-4 border-t">
                    <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            className="w-full pr-12 flex-1 border-2 border-yellow-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white/90"
                            value={message}
                            placeholder="Hikayeni anlatmaya başla..."
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            rows="4"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={isListening ? toggleListening : toggleListening}
                                className={`flex-1 sm:flex-none btn-primary px-4 py-2 ${isListening ? "bg-red-500 hover:bg-red-600" : 'bg-yellow-500 hover:bg-yellow-600'}`}
                                title={isListening ? 'Kaydı Durdur' : 'Sesli Anlatım Başlat'}
                            >
                                {isListening ?
                                    <FaMicrophoneSlash className="w-5 h-5" /> :
                                    <FaMicrophone className="w-5 h-5" />
                                }
                            </button>
                            <button
                                className="flex-1 sm:flex-none btn-primary bg-yellow-500 hover:bg-yellow-600 px-6 py-2"
                                onClick={sendMsg}
                                disabled={!message.trim()}
                            >
                                Gönder
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatItem({ item }) {
    return (
        <div className={`mb-2 ${item.type === 'send' ? 'ml-auto' : 'mr-auto'}`}>
            <div
                className={`rounded-lg px-4 py-2 max-w-[75%] ${item.type === 'send'
                    ? 'bg-yellow-500 text-white mr-8'
                    : 'bg-white/90 backdrop-blur-sm ml-8 text-[hsla(42,72%,47%,1)]'
                    }`}
            >
                {item.text}
            </div>
        </div>
    );
}

const ChatItemMemo = memo(ChatItem, (prevProps, nextProps) => true);
