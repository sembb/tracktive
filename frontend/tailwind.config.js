/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
	],
	theme: {
		extend: {
		colors: {
			slygray: '#1a1a1e',
		},
		fontFamily: {
			dm: ["var(--font-dm-sans)", "sans-serif"],
			bebas: ["var(--font-bebas-neue)", "sans-serif"],
		},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: ['flyon'], // 👈 Set your desired theme here
	},
}