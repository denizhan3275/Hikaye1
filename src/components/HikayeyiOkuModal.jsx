import { useState, useRef } from 'react';
import { FaPlay, FaStop, FaFileDownload } from 'react-icons/fa';

function HikayeyiOkuModal({ isOpen, onClose, story }) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);

    if (!isOpen) return null;

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

    const handleDownload = () => {
        try {
            const element = document.createElement('a');
            const file = new Blob([story.content], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = 'hikaye.txt';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (error) {
            console.error('Dosya indirme hatası:', error);
            alert('Dosya indirilirken bir hata oluştu');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
                {/* Kapatma Butonu */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Başlık ve Kontrol Butonları */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">
                        {story?.storyName || story?.character + ' Hikaye' || 'Hikaye'}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => speak(story?.content)}
                            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                            title={isSpeaking ? "Sesi Durdur" : "Sesli Dinle"}
                        >
                            {isSpeaking ? <FaStop className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
                            {isSpeaking ? "Durdur" : "Dinle"}
                        </button>
                        <button
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-4 py-2 mr-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            title="Hikayeyi İndir"
                        >
                            <FaFileDownload className="w-4 h-4" />
                            İndir
                        </button>
                    </div>
                </div>

                {/* Hikaye İçeriği */}
                <div className="mt-4">
                    <div className="prose max-w-none">
                        {story?.content.split('\n').map((paragraph, index) => (
                            <p key={index} className="text-gray-700 mb-4">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HikayeyiOkuModal;