import { useState } from 'react'

function PromptInput({ onPromptSubmit, isLoading }) {
    const [prompt, setPrompt] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!prompt.trim()) return
        onPromptSubmit(prompt)
    }

    return (
        <div className="max-w-2xl mx-auto my-8">
            <h2 className="text-xl font-semibold mb-4">Bugün ne hakkında yazalım?</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-4 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
                    rows="4"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Örnek: Bir uzay yolculuğu hikayesi yaz..."
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg 
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
                    disabled={isLoading}
                >
                    {isLoading ? 'Hikaye Oluşturuluyor...' : 'Hikaye Oluştur'}
                </button>
            </form>
        </div>
    )
}

export default PromptInput 