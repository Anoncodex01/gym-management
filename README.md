# Gym Management System

A modern gym management system built with React, Vite, and TypeScript. Features include member management, payment processing with ZenoPay, and more.

## Features

- Member Management
- Payment Processing with ZenoPay Integration
- Real-time Payment Status Updates
- Modern UI with React

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- ZenoPay Account

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your actual credentials.

## Environment Variables

Create a `.env` file with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ZENO_PAY_ACCOUNT_ID=your_zeno_account_id
VITE_ZENO_PAY_API_KEY=your_zeno_api_key
VITE_ZENO_PAY_SECRET_KEY=your_zeno_secret_key
VITE_API_URL=http://localhost:5173
```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

## Building for Production

```bash
npm run build
# or
yarn build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
