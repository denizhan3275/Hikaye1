/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'vatena': ['Vatena', 'sans-serif'],
                'staychill': ['StayChill', 'sans-serif'],
                'quicksand': ['Quicksand', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    hover: '#4f46e5'
                },
                'custom-border': '  rgb(0, 0, 0)',

                'bg-carAndTextArea': " hsla(42, 72%, 47%, 1)",

                'text-buff': 'rgb(18, 17, 16)'
            }

        },
    },
    plugins: [],
} 