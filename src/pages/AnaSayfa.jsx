import React from 'react';
import { useNavigate } from 'react-router-dom';
import backgroundImage from "../assets/background.jpg";

function AnaSayfa() {
    const navigate = useNavigate();

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
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Başlık */}
                <div className="bg-black/30 backdrop-blur-sm p-6">
                    <h1 className="text-6xl font-bold font-vatena text-white text-center">
                        Çocuklar İçin Hikaye Oluşturucu
                    </h1>
                </div>

                {/* Butonlar */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center p-8 max-w-3xl w-full">
                        <div className="flex space-x-72">
                            <button
                                onClick={() => navigate('/app')}
                                className="w-1/2 btn-primary bg-yellow-500 hover:bg-yellow-600 text-white text-xl py-8 px-8 rounded-lg transition-all transform hover:scale-105"
                            >
                                Sıfırdan Hikaye Oluştur
                            </button>

                            <button
                                onClick={() => navigate('/chat2')}
                                className="w-1/2 btn-primary bg-yellow-500 hover:bg-yellow-600 text-white text-xl py-8 px-8 rounded-lg transition-all transform hover:scale-105"
                            >
                                Aklındaki Hikayeyi Oluştur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnaSayfa;
