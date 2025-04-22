import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from "../assets/background.jpg";
import { auth, logoutUser } from "../services/firebaseConfig";
import { FaStar, FaTrophy } from 'react-icons/fa';

import UyeOlModal from "../components/uyeOlModal"
import GirisYapModal from "../components/girişYapModal"
import HesapBilgileriModal from "../components/hesapBilgileriModal"
import UyelerinSkorlarıModal from "../components/uyelerinSkorlarıModal"

function AnaSayfa() {
    const navigate = useNavigate();
    const [isGirisModalOpen, setIsGirisModalOpen] = useState(false);
    const [isUyeOlModalOpen, setIsUyeOlModalOpen] = useState(false);
    const [isHesapModalOpen, setIsHesapModalOpen] = useState(false);
    const [isSkorlarModalOpen, setIsSkorlarModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            const { error } = await logoutUser();
            if (error) {
                console.error('Çıkış hatası:', error);
            }
        } catch (err) {
            console.error('Çıkış işlemi başarısız:', err);
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

            {/* Modallar */}
            <GirisYapModal
                isOpen={isGirisModalOpen}
                onClose={() => setIsGirisModalOpen(false)}
            />
            <UyeOlModal
                isOpen={isUyeOlModalOpen}
                onClose={() => setIsUyeOlModalOpen(false)}
            />
            <HesapBilgileriModal
                isOpen={isHesapModalOpen}
                onClose={() => setIsHesapModalOpen(false)}
            />
            <UyelerinSkorlarıModal
                isOpen={isSkorlarModalOpen}
                onClose={() => setIsSkorlarModalOpen(false)}
            />

            {/* İçerik */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Başlık ve Butonlar */}
                <div className="bg-black/30 backdrop-blur-sm p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-vatena text-white text-center sm:text-left">
                                Çocuklar İçin Hikaye Oluşturucu
                            </h1>

                            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <button
                                        onClick={() => navigate("/favorites")}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                                        title="Favori Hikayelerim"
                                    >
                                        <FaStar className="w-5 h-5" />
                                        <span className="hidden sm:inline">Favorilerim</span>
                                    </button>
                                    <button
                                        onClick={() => setIsSkorlarModalOpen(true)}
                                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        title="Üyelerin Skorları"
                                    >
                                        <FaTrophy className="w-5 h-5" />
                                        <span className="hidden sm:inline">Skor Tablosu</span>
                                    </button>
                                </div>

                                {currentUser ? (
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsHesapModalOpen(true)}
                                            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                            <span className="hidden sm:inline">Hesabım</span>
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex-1 sm:flex-initial px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            <span className="hidden sm:inline">Çıkış Yap</span>
                                            <span className="sm:hidden">Çıkış</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => setIsGirisModalOpen(true)}
                                            className="flex-1 sm:flex-initial px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                        >
                                            <span className="hidden sm:inline">Giriş Yap</span>
                                            <span className="sm:hidden">Giriş</span>
                                        </button>
                                        <button
                                            onClick={() => setIsUyeOlModalOpen(true)}
                                            className="flex-1 sm:flex-initial px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <span className="hidden sm:inline">Üye Ol</span>
                                            <span className="sm:hidden">Üye</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ana Butonlar */}
                <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="w-full max-w-3xl mx-auto">
                        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
                            <button
                                onClick={() => navigate('/app')}
                                className="w-full md:w-1/2 btn-primary bg-yellow-500 hover:bg-yellow-600 text-white text-lg sm:text-xl py-6 sm:py-8 px-4 sm:px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
                            >
                                <span className="text-center">Sıfırdan Hikaye Oluştur</span>
                            </button>

                            <button
                                onClick={() => navigate('/chat2')}
                                className="w-full md:w-1/2 btn-primary bg-yellow-500 hover:bg-yellow-600 text-white text-lg sm:text-xl py-6 sm:py-8 px-4 sm:px-8 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center"
                            >
                                <span className="text-center">Aklındaki Hikayeyi Oluştur</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaSayfa;
