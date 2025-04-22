import React, { useState } from 'react';
import { registerUser } from '../services/firebaseConfig';

const UyeOlModal = ({ isOpen, onClose }) => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [email, setEmail] = useState('');
    const [sifre, setSifre] = useState('');
    const [sifreTekrar, setSifreTekrar] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!kullaniciAdi || !email || !sifre || !sifreTekrar) {
                setError('Tüm alanları doldurunuz!');
                setLoading(false);
                return;
            }

            if (kullaniciAdi.length < 3) {
                setError('Kullanıcı adı en az 3 karakter olmalıdır!');
                setLoading(false);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                setError('Geçerli bir e-posta adresi giriniz!');
                setLoading(false);
                return;
            }

            if (sifre !== sifreTekrar) {
                setError('Şifreler eşleşmiyor!');
                setLoading(false);
                return;
            }

            if (sifre.length < 6) {
                setError('Şifre en az 6 karakter olmalıdır!');
                setLoading(false);
                return;
            }

            const { user, error: registerError } = await registerUser(email, sifre, kullaniciAdi);

            if (registerError) {
                setError(registerError);
                setLoading(false);
                return;
            }

            // Başarılı kayıt
            console.log('Kayıt başarılı:', user);
            onClose();

        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyiniz.');
            console.error('Kayıt hatası:', err);
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

                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Üye Ol</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            value={kullaniciAdi}
                            onChange={(e) => setKullaniciAdi(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="En az 3 karakter olmalıdır"
                            disabled={loading}
                            minLength={3}
                        />
                    </div>

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
                            placeholder="En az 6 karakter olmalıdır"
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            value={sifreTekrar}
                            onChange={(e) => setSifreTekrar(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Şifrenizi tekrar giriniz"
                            disabled={loading}
                            minLength={6}
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
                        {loading ? 'Üye Olunuyor...' : 'Üye Ol'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UyeOlModal;