function CharacterSelector({ selectedCharacter, onCharacterSelect }) {
    const characters = [
        { id: 'cat', name: 'Kedi' },
        { id: 'dragon', name: 'Ejderha' },
        { id: 'child', name: 'Çocuk' },
        { id: 'spaceship', name: 'Uzay Gemisi' }

    ]

    return (
        <div className="max-w-2xl mx-auto my-8">
            <h2 className="text-xl font-semibold mb-4">Karakterini Seç</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {characters.map((character) => (
                    <button
                        key={character.id}
                        className={`p-4 rounded-lg border ${selectedCharacter === character.id
                            ? 'bg-purple-100 border-purple-500'
                            : 'bg-white hover:bg-gray-50'
                            }`}
                        onClick={() => onCharacterSelect(character.id)}
                    >
                        {character.name}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default CharacterSelector 