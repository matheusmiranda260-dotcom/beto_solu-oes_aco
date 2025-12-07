/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                beto: {
                    dark: '#1e293b', // Uniforme cinza escuro
                    orange: '#ea580c', // Cor da ferrugem/logo
                    light: '#f8fafc', // Capacete branco/fundo
                    steel: '#64748b', // Cor do aço
                }
            }
        },
    },
    plugins: [],
}
