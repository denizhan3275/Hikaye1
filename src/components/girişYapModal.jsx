import React, { useState } from 'react';
import { loginUser } from '../services/firebaseConfig';

const GirisYapModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!email || !sifre) {
                setError('Tüm alanları doldurunuz!');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Geçerli bir e-posta adresi giriniz!');
                return;
            }

            const { user, error: loginError } = await loginUser(email, sifre);

            if (loginError) {
                setError(loginError);
                return;
            }

            // Başarılı giriş
            console.log('Giriş başarılı:', user);
            onClose();

        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
            console.error('Giriş hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                    disabled={loading}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Giriş Yap</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            E-posta Adresi
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ornek@gmail.com"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Şifre
                        </label>
                        <input
                            type="password"
                            value={sifre}
                            onChange={(e) => setSifre(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Şifrenizi giriniz"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm font-medium">{error}</div>
                    )}

                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white py-3 rounded-lg transition-colors font-medium ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                // Şifremi unuttum işlemleri burada yapılacak
                                console.log('Şifremi unuttum');
                            }}
                            className="text-blue-500 hover:text-blue-600 text-sm"
                            disabled={loading}
                        >
                            Şifremi Unuttum
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GirisYapModal;
