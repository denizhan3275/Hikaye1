import React, { useState, useEffect } from 'react';
import { auth, getKullaniciBilgileri } from '../services/firebaseConfig';

const HesapBilgileriModal = ({ isOpen, onClose }) => {
    const [kullaniciBilgileri, setKullaniciBilgileri] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const bilgileriGetir = async () => {
            if (!auth.currentUser) return;

            try {
                const { data, error } = await getKullaniciBilgileri(auth.currentUser.uid);
                if (error) {
                    setError(error);
                } else {
                    setKullaniciBilgileri(data);
                }
            } catch (err) {
                setError('Bilgiler alınırken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            bilgileriGetir();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Hesap Bilgilerim</h2>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-4">{error}</div>
                ) : kullaniciBilgileri ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-white">
                                    {kullaniciBilgileri.kullaniciAdi?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="border-b pb-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Kullanıcı Adı</h3>
                                <p className="text-lg text-gray-800">{kullaniciBilgileri.kullaniciAdi}</p>
                            </div>

                            <div className="border-b pb-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">E-posta Adresi</h3>
                                <p className="text-lg text-gray-800">{kullaniciBilgileri.email}</p>
                            </div>

                            <div className="border-b pb-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Kayıt Tarihi</h3>
                                <p className="text-lg text-gray-800">
                                    {new Date(kullaniciBilgileri.kayitTarihi).toLocaleDateString('tr-TR')}
                                </p>
                            </div>

                            <div className="pb-4">
                                <h3 className="text-sm font-semibold text-gray-600 mb-1">Son Giriş Tarihi</h3>
                                <p className="text-lg text-gray-800">
                                    {new Date(kullaniciBilgileri.sonGirisTarihi).toLocaleDateString('tr-TR')}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default HesapBilgileriModal;
