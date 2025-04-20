function StorySettings({ storyLength, languageLevel, onSettingsChange }) {
    return (
        <div className="max-w-2xl mx-auto my-8">
            <h2 className="text-xl font-semibold mb-4">Hikaye Ayarları</h2>

            <div className="space-y-6">
                {/* Hikaye Uzunluğu */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Hikaye Uzunluğu
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {['short', 'medium', 'long'].map((length) => (
                            <button
                                key={length}
                                className={`p-3 rounded-lg border ${storyLength === length
                                    ? 'bg-purple-100 border-purple-500'
                                    : 'bg-white hover:bg-gray-50'
                                    }`}
                                onClick={() => onSettingsChange('storyLength', length)}
                            >
                                {length === 'short' && 'Kısa'}
                                {length === 'medium' && 'Orta'}
                                {length === 'long' && 'Uzun'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dil Seviyesi */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Dil Seviyesi
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        {['simple', 'advanced'].map((level) => (
                            <button
                                key={level}
                                className={`p-3 rounded-lg border ${languageLevel === level
                                    ? 'bg-purple-100 border-purple-500'
                                    : 'bg-white hover:bg-gray-50'
                                    }`}
                                onClick={() => onSettingsChange('languageLevel', level)}
                            >
                                {level === 'simple' && 'Basit'}
                                {level === 'advanced' && 'İleri'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StorySettings 