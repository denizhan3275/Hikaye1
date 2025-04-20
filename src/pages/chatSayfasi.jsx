import React, { memo, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMicrophone, FaPlay, FaStop, FaPlus } from 'react-icons/fa';
import backgroundImage from "../assets/background2.jpg";
import { generateChatResponse } from '../services/api';

export default function ChatSayfasi() {
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
    const location = useLocation();
    const storyRef = useRef(location.state?.story || null);

    // Otomatik scroll için useEffect
    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Konuşma tanıma için useEffect
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'tr-TR';

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setMessage(transcript);
                setIsListening(false);
            };

            recognition.onerror = () => {
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

    // Mikrofon dinlemeyi başlat/durdur
    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
            setMessage('');
        }
        setIsListening(!isListening);
    };

    // Metni sesli oku
    const speak = (text) => {
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
            setIsSpeaking(false);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'tr-TR';
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        synthRef.current.speak(utterance);
    };

    // Component mount olduğunda hoşgeldin mesajı
    useEffect(() => {
        const sendWelcomeMessage = async () => {
            try {
                setIsTyping(true);
                const welcomeResponse = await generateChatResponse(
                    "Merhaba",
                    storyRef.current
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
                const response = await generateChatResponse(
                    message,
                    storyRef.current
                );

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

    // Enter tuşu ile gönderme
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMsg();
        }
    };

    const handleAddToStory = (text) => {
        try {
            const savedFavorites = JSON.parse(localStorage.getItem('favoriteStories') || '[]');
            const storyContent = storyRef.current;

            // Düzenlenen hikayeyi bul
            const storyToUpdate = savedFavorites.find(story => story.content === storyContent);

            if (storyToUpdate) {
                // Eğer aiResponses dizisi yoksa oluştur
                if (!storyToUpdate.aiResponses) {
                    storyToUpdate.aiResponses = [];
                }

                // Yeni cevabı ekle
                storyToUpdate.aiResponses.push({
                    response: text,
                    timestamp: new Date().toISOString()
                });

                // LocalStorage'ı güncelle
                localStorage.setItem('favoriteStories', JSON.stringify(savedFavorites));
                alert('Yapay zeka cevabı hikayeye eklendi!');
            } else {
                alert('Düzenlenen hikaye bulunamadı!');
            }
        } catch (error) {
            console.error('Ekleme hatası:', error);
            alert('Cevap eklenirken bir hata oluştu');
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
                    <div className="max-w-3xl flex items-center justify-between">
                        <button
                            onClick={() => navigate('/favorites')}
                            className="btn-primary mx-0 bg-yellow-500 hover:bg-yellow-600"
                        >
                            <FaArrowLeft className="w-8 h-6" />
                        </button>

                    </div>
                </div>

                {/* Mesajlar */}
                <div className="flex-1 overflow-y-auto p-4" style={{ display: 'flex', flexDirection: 'column-reverse' }}>
                    <div ref={messageEndRef} />
                    {messages.map((item) => (
                        <div key={item.id} className={`mb-2 ${item.type === 'send' ? 'ml-auto' : 'mr-auto'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[75%] flex items-center gap-2 ${item.type === 'send'
                                ? 'bg-yellow-500 text-white mr-8'
                                : 'bg-white/90 backdrop-blur-sm ml-8 text-[hsla(42,72%,47%,1)]'
                                }`}>
                                <span>{item.text}</span>
                                {item.type === 'receive' && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => speak(item.text)}
                                            className="ml-2 text-yellow-600 hover:text-yellow-700"
                                            title="Sesli Dinle"
                                        >
                                            {isSpeaking ? <FaStop className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleAddToStory(item.text)}
                                            className="ml-2 text-yellow-600 hover:text-yellow-700"
                                            title="Bu Metni Hikayeye Ekle"
                                        >
                                            <FaPlus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="mb-2 mr-auto">
                            <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                                Yazıyor...
                            </div>
                        </div>
                    )}
                </div>

                {/* Mesaj gönderme alanı */}
                <div className="bg-white/80 backdrop-blur-sm p-4 border-t">
                    <div className="max-w-3xl mx-auto flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            className="flex-1 border-2 border-yellow-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white/90"
                            value={message}
                            placeholder="Hikayeyi nasıl değiştirmek istersin?"
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button
                            onClick={toggleListening}
                            className={`btn-primary px-4 py-2 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
                                }`}
                        >
                            <FaMicrophone className={`w-6 h-6 ${isListening ? 'animate-pulse' : ''}`} />
                        </button>
                        <button
                            className="btn-primary bg-yellow-500 hover:bg-yellow-600 px-6 py-2"
                            onClick={sendMsg}
                            disabled={!message.trim()}
                        >
                            Gönder
                        </button>
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
