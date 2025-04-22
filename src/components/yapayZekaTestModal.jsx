import React, { useState, useEffect } from 'react';
import { generateTest } from '../services/api';
import { auth, db } from '../services/firebaseConfig';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';

const YapayZekaTestModal = ({ isOpen, onClose, story }) => {
    const [questions, setQuestions] = useState([]);
    const [currentAnswers, setCurrentAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 dakika = 300 saniye
    const [testCompleted, setTestCompleted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        if (isOpen && story) {
            loadTest();
        }
        return () => {
            // Modal kapandığında state'leri sıfırla
            setQuestions([]);
            setCurrentAnswers({});
            setTestCompleted(false);
            setResults(null);
            setTimeLeft(300);
        };
    }, [isOpen, story]);

    useEffect(() => {
        let timer;
        if (isOpen && timeLeft > 0 && !testCompleted) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        submitTest();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, timeLeft, testCompleted]);

    const loadTest = async () => {
        try {
            setLoading(true);
            setError('');
            const testData = await generateTest(story.content);
            setQuestions(testData);
        } catch (err) {
            setError('Test yüklenirken bir hata oluştu: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId, answer) => {
        if (!testCompleted) {
            setCurrentAnswers(prev => ({
                ...prev,
                [questionId]: answer
            }));
        }
    };

    const submitTest = async () => {
        const totalQuestions = questions.length;
        let correctAnswers = 0;

        questions.forEach((question, index) => {
            if (currentAnswers[index] === question.correctAnswer) {
                correctAnswers++;
            }
        });

        const score = (correctAnswers / totalQuestions) * 100;

        const results = {
            totalQuestions,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            score: score.toFixed(2),
            timeTaken: 300 - timeLeft
        };

        setResults(results);
        setTestCompleted(true);

        // Firebase'e test sonuçlarını kaydet
        if (auth.currentUser) {
            try {
                const userRef = doc(db, 'users', auth.currentUser.uid);
                const userDoc = await getDoc(userRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const testCount = (userData.testCount || 0) + 1;
                    const totalScore = (userData.totalScore || 0) + parseFloat(results.score);
                    const successRate = totalScore / testCount;

                    await updateDoc(userRef, {
                        testCount,
                        totalScore,
                        successRate,
                        lastTestDate: new Date(),
                        username: auth.currentUser.displayName || 'İsimsiz Kullanıcı'
                    });
                } else {
                    // Kullanıcı dökümanı yoksa yeni oluştur
                    await setDoc(userRef, {
                        testCount: 1,
                        totalScore: parseFloat(results.score),
                        successRate: parseFloat(results.score),
                        lastTestDate: new Date(),
                        username: auth.currentUser.displayName || 'İsimsiz Kullanıcı'
                    });
                }
            } catch (error) {
                console.error('Test sonuçları kaydedilirken hata oluştu:', error);
            }
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 pr-8">
                    Hikaye Testi
                </h2>

                {!testCompleted && (
                    <div className="sticky top-0 bg-white py-2 border-b mb-4 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                            Kalan Süre: {formatTime(timeLeft)}
                        </span>
                        <span className="text-sm text-gray-600">
                            {Object.keys(currentAnswers).length} / {questions.length} Soru Cevaplandı
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : testCompleted ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-xl font-bold mb-4 text-center">Test Sonuçları</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-100 p-4 rounded-lg">
                                    <p className="text-sm text-green-800">Doğru Sayısı</p>
                                    <p className="text-2xl font-bold text-green-600">{results.correctAnswers}</p>
                                </div>
                                <div className="bg-red-100 p-4 rounded-lg">
                                    <p className="text-sm text-red-800">Yanlış Sayısı</p>
                                    <p className="text-2xl font-bold text-red-600">{results.wrongAnswers}</p>
                                </div>
                                <div className="bg-blue-100 p-4 rounded-lg">
                                    <p className="text-sm text-blue-800">Başarı Yüzdesi</p>
                                    <p className="text-2xl font-bold text-blue-600">%{results.score}</p>
                                </div>
                                <div className="bg-purple-100 p-4 rounded-lg">
                                    <p className="text-sm text-purple-800">Geçen Süre</p>
                                    <p className="text-2xl font-bold text-purple-600">{formatTime(results.timeTaken)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {questions.map((question, index) => (
                                <div key={index} className={`p-4 rounded-lg ${currentAnswers[index] === question.correctAnswer
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}>
                                    <p className="font-semibold mb-2">{index + 1}. {question.question}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {question.options.map((option, optIndex) => (
                                            <div key={optIndex} className={`p-2 rounded ${option === question.correctAnswer
                                                ? 'bg-green-200 text-green-800'
                                                : currentAnswers[index] === option
                                                    ? 'bg-red-200 text-red-800'
                                                    : 'bg-gray-100'
                                                }`}>
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                <p className="font-semibold mb-4">{index + 1}. {question.question}</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {question.options.map((option, optIndex) => (
                                        <button
                                            key={optIndex}
                                            onClick={() => handleAnswerSelect(index, option)}
                                            className={`p-3 rounded-lg text-left transition-colors ${currentAnswers[index] === option
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white hover:bg-gray-100'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="sticky bottom-0 bg-white py-4 border-t mt-6">
                            <button
                                onClick={submitTest}
                                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                disabled={Object.keys(currentAnswers).length !== questions.length}
                            >
                                Testi Bitir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default YapayZekaTestModal;
