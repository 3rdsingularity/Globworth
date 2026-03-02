# GlobeWorth - Global Portfolio Tracker

A modern, responsive web application for tracking global assets and liabilities across multiple currencies with real-time exchange rates.

![GlobeWorth Dashboard](https://z4miaks6rlsrq.ok.kimi.link)

## Features

### Core Features

- **Multi-Currency Support**: Track assets in USD, EUR, INR, GBP, JPY, CHF, AUD, CAD, SGD, AED
- **Real-Time Exchange Rates**: Live FX rates with 1-hour caching
- **Asset Management**: Track stocks, mutual funds, ETFs, crypto, real estate, gold, and more
- **Liability Tracking**: Monitor loans, credit cards, mortgages with interest rates
- **Net Worth Calculation**: Automatic conversion to your preferred display currency
- **Dashboard Analytics**: Visual charts for asset allocation, currency exposure, and net worth trends

### Authentication & Security

- **Google OAuth**: Secure login with Gmail
- **Firebase Authentication**: Persistent sessions with secure logout
- **Firestore Database**: Cloud storage with offline persistence
- **Data Encryption**: Sensitive data protection

### Dashboard & Insights

- **Net Worth Overview**: Total assets, liabilities, and debt ratio
- **Asset Allocation Pie Chart**: Visual breakdown by asset type
- **Net Worth Over Time**: Historical trend analysis
- **Currency Exposure**: Track FX risk across currencies
- **Geographic Distribution**: India vs Germany vs Other exposure
- **AI-Powered Insights**: Personalized recommendations

### Data Management

- **Manual Snapshots**: Save portfolio state at any time
- **Auto Snapshots**: Monthly automatic backups
- **Data Export**: JSON backup for local storage
- **Data Import**: Restore from backup files
- **Settings**: Customizable display currency, dark mode, live price fetching

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Recharts** for data visualization
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Firebase Authentication** (Google OAuth)
- **Cloud Firestore** for database
- **Firebase Hosting** ready

### APIs
- **ExchangeRate-API** for real-time FX rates
- **Free tier** with 1-hour caching

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Firebase project (for production)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/globeworth.git
cd globeworth
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. Start the development server:
```bash
npm run dev
```

6. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components
│   └── layout/       # Layout components
├── lib/
│   ├── firebase.ts   # Firebase configuration
│   └── exchangeRate.ts # FX rate service
├── pages/
│   ├── Login.tsx     # Authentication page
│   ├── Dashboard.tsx # Main dashboard
│   ├── Assets.tsx    # Asset management
│   ├── Liabilities.tsx # Liability management
│   ├── Insights.tsx  # Analytics & insights
│   └── Settings.tsx  # User settings
├── store/
│   └── index.ts      # Zustand store
├── types/
│   └── index.ts      # TypeScript types
└── App.tsx           # Main app component
```

## Supported Asset Types

- **Mutual Funds** (India - Coin/Zerodha)
- **Stocks** (Individual equities)
- **ETFs** (Exchange-traded funds)
- **Cash** (Savings, checking accounts)
- **Cryptocurrency** (Bitcoin, Ethereum, etc.)
- **Real Estate** (Property investments)
- **Gold** (Physical or digital gold)
- **Fixed Deposits** (Term deposits)
- **PPF** (Public Provident Fund - India)
- **EPF** (Employee Provident Fund - India)
- **Bank Accounts** (Checking/savings)
- **Emergency Fund** (Liquid savings)
- **Other** (Custom assets)

## Supported Liability Types

- **Education Loans** (Student loans)
- **Personal Loans**
- **Credit Cards**
- **Mortgages** (Home loans)
- **Car Loans**
- **Other** (Custom liabilities)

## Currency Support

| Currency | Code | Symbol |
|----------|------|--------|
| US Dollar | USD | $ |
| Euro | EUR | € |
| Indian Rupee | INR | ₹ |
| British Pound | GBP | £ |
| Japanese Yen | JPY | ¥ |
| Swiss Franc | CHF | Fr |
| Australian Dollar | AUD | A$ |
| Canadian Dollar | CAD | C$ |
| Singapore Dollar | SGD | S$ |
| UAE Dirham | AED | د.إ |

## Key Features Explained

### Exchange Rate Handling

- Rates are fetched from ExchangeRate-API (free tier)
- 1-hour caching to minimize API calls
- Fallback rates available if API fails
- All conversions happen in real-time

### Multi-Currency Display

1. Select your preferred display currency in Settings
2. All values automatically convert
3. Original currency is preserved for each asset
4. Historical snapshots store FX rates at time of capture

### Data Synchronization

- Automatic sync with Firebase Firestore
- Offline persistence enabled
- Real-time updates across devices
- Secure data encryption

### Snapshots

- Manual snapshots: Click "Take Snapshot" anytime
- Stores: Net worth, asset breakdown, FX rates
- Used for historical trend analysis
- Export/import compatible

## Security Considerations

- **HTTPS Only**: All communications encrypted
- **OAuth 2.0**: Secure Google authentication
- **Firestore Security Rules**: Data access control
- **No Token Storage**: OAuth tokens not stored locally
- **GDPR Compliant**: Data handling for EU users

## Future Enhancements

- [ ] Google Drive integration for backups
- [ ] Indian mutual fund NAV API integration
- [ ] Stock price API (Alpha Vantage/Yahoo Finance)
- [ ] Open Banking API for N26
- [ ] Portfolio rebalancing suggestions
- [ ] FIRE calculator
- [ ] Tax estimation (India & Germany)
- [ ] Monthly email summaries
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests:
- Create an issue on GitHub
- Email: support@globeworth.app

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [ExchangeRate-API](https://www.exchangerate-api.com/) for FX rates
- [Firebase](https://firebase.google.com/) for backend services
- [Recharts](https://recharts.org/) for data visualization

---

Built with ❤️ for global investors
