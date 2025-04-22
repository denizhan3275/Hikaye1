import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

// Modal'ı erişilebilirlik için ana elemana bağlama
Modal.setAppElement('#root');

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '2rem',
        borderRadius: '0.5rem',
    },
    overlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
    },
};

function UyelerinSkorlarıModal({ isOpen, onClose }) {
    const [users, setUsers] = useState([]);
    const [sortCriteria, setSortCriteria] = useState('testCount');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersCollection = collection(db, 'users');
                const userSnapshot = await getDocs(usersCollection);
                const userList = userSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setUsers(userList);
            } catch (error) {
                console.error('Kullanıcı verileri alınamadı:', error);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    const sortedUsers = [...users].sort((a, b) => {
        if (sortCriteria === 'testCount') {
            return (b.testCount || 0) - (a.testCount || 0);
        } else {
            return (b.successRate || 0) - (a.successRate || 0);
        }
    });

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            style={customStyles}
            contentLabel="Üyelerin Skorları"
        >
            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        Üyelerin Skorları
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-gray-700 mr-2">Sıralama Kriteri:</label>
                    <select
                        value={sortCriteria}
                        onChange={(e) => setSortCriteria(e.target.value)}
                        className="border rounded-md px-3 py-1"
                    >
                        <option value="testCount">En Çok Test Çözen</option>
                        <option value="successRate">En Yüksek Başarı Oranı</option>
                    </select>
                </div>

                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Sıra
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kullanıcı Adı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Çözülen Test Sayısı
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Başarı Yüzdesi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sortedUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.username || 'İsimsiz Kullanıcı'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.testCount || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.successRate ? `%${user.successRate.toFixed(1)}` : '%0'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}

export default UyelerinSkorlarıModal;
