const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateStory = async (prompt, character, length, level) => {
    try {
        const lengthMap = {
            short: '250 kelime',
            medium: '500 kelime',
            long: '1000 kelime'
        }

        const levelMap = {
            simple: '7-10 yaş arası çocuklar için basit',
            advanced: '11-14 yaş arası çocuklar için'
        }

        // Prompt'u hazırla
        const fullPrompt = `Sen çocuklar için hikaye yazan bir yazarsın.
        ${levelMap[level]} seviyesinde, yaklaşık ${lengthMap[length]} uzunluğunda,
        Türkçe hikayeler yazıyorsun. Hikayelerin eğitici ve eğlenceli olmalı.
        
        Ana karakter "${character}" olan şu konuda bir hikaye yaz: ${prompt}`;

        console.log('Gemini API isteği gönderiliyor...');

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Hata Detayı:', errorData);
            throw new Error(`API Hatası: ${errorData.error?.message || 'Bilinmeyen hata'}`);
        }

        const data = await response.json();
        console.log('Gemini API yanıtı:', data);

        // API yanıtını kontrol et
        if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.error('Geçersiz API yanıtı:', data);
            throw new Error('API beklenmeyen bir yanıt döndü');
        }

        // Hikaye metnini döndür
        const storyText = data.candidates[0].content.parts[0].text;
        if (!storyText) {
            throw new Error('Hikaye metni boş');
        }

        return storyText;

    } catch (error) {
        console.error('Gemini API Hatası:', error);
        if (error.message.includes('Failed to fetch')) {
            throw new Error('API\'ye bağlanılamadı. İnternet bağlantınızı kontrol edin.');
        }
        throw new Error('Hikaye oluşturulurken bir hata oluştu: ' + error.message);
    }
}


/////////////

export const generateChatResponse = async (message, story = null) => {
    try {
        const prompt = `Sen çocuklar için hikaye düzenleyen bir yapay zeka asistanısın. 
        ${story ? `Şu hikayeyi düzenlememiz gerekiyor: "${story}"` : 'Yeni bir hikaye oluşturmak veya mevcut bir hikayeyi düzenlemek için yardımcı oluyorsun.'}
        
        Kullanıcı mesajı: ${message}
        
        Lütfen yardımcı ol ve çocuklara uygun, nazik bir dil kullan. Önerilerini detaylı açıkla.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.8,
                    topK: 40
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Hatası: ${errorData.error?.message || 'Bilinmeyen hata'}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Chat API Hatası:', error);
        throw new Error('Mesaj işlenirken bir hata oluştu: ' + error.message);
    }
}

export const generateTest = async (storyContent) => {
    try {
        const prompt = `Sen bir öğretmensin. Aşağıdaki hikayeyi oku ve bu hikaye hakkında 10 adet çoktan seçmeli soru hazırla. 
        Her sorunun 4 şıkkı olmalı ve doğru cevabı belirtmelisin.

        Hikaye:
        ${storyContent}

        Soruları şu formatta hazırla ve yanıtla:
        [
            {
                "question": "Soru metni",
                "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
                "correctAnswer": "Doğru şıkkın tam metni"
            }
        ]

        Sadece JSON formatında yanıt ver, başka açıklama ekleme.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                    topP: 0.8,
                    topK: 40
                }
            })
        });

        if (!response.ok) {
            throw new Error('API yanıt vermedi');
        }

        const data = await response.json();
        const testContent = data.candidates[0].content.parts[0].text;

        // JSON string'i parse et
        const jsonStr = testContent.replace(/```json\n?|\n?```/g, '').trim();
        const questions = JSON.parse(jsonStr);

        return questions;

    } catch (error) {
        console.error('Test oluşturma hatası:', error);
        throw new Error('Test oluşturulurken bir hata oluştu: ' + error.message);
    }
}; 