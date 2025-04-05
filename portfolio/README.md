# Portfolio Management Application

A comprehensive web application for managing stock portfolios, tracking investments, and analyzing financial performance.

## Features

- **User Authentication**: Secure sign-up, login, and account management
- **Dashboard**: Overview of portfolio performance with key metrics
- **Stock Management**: Add, buy, sell, and track individual stocks
- **Portfolio Analysis**: Visualize asset allocation and performance trends
- **Transaction History**: Track all buy/sell transactions
- **Stock Details**: View detailed information and charts for each stock
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Charts**: Chart.js / React-Chartjs-2
- **State Management**: React Context API
- **Data Fetching**: SWR / React Query
- **Styling**: Tailwind CSS with custom UI components

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/portfolio-management.git
   cd portfolio-management
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   - Create a `.env.local` file in the root directory
   - Add the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
portfolio/
├── app/                  # Next.js app directory
│   ├── api/              # API routes
│   ├── components/       # React components
│   ├── dashboard/        # Dashboard pages
│   ├── lib/              # Utility libraries
│   ├── providers/        # Context providers
│   ├── utils/            # Utility functions
│   ├── layout.js         # Root layout
│   └── page.js           # Landing page
├── public/               # Static assets
├── scripts/              # Data upload scripts
└── tailwind.config.js    # Tailwind CSS configuration
```

## API Endpoints

- **Authentication**
  - `POST /api/auth/register`: Register a new user
  - `POST /api/auth/[...nextauth]`: NextAuth API routes

- **Stocks**
  - `GET /api/stocks`: Get all stocks
  - `POST /api/stocks`: Add a new stock
  - `GET /api/stocks/[stockId]`: Get a specific stock
  - `PUT /api/stocks/[stockId]`: Update a stock
  - `DELETE /api/stocks/[stockId]`: Delete a stock

- **Transactions**
  - `GET /api/transactions`: Get all transactions
  - `POST /api/transactions`: Create a new transaction

- **Portfolio**
  - `GET /api/holdings`: Get current holdings
  - `GET /api/portfolio/summary`: Get portfolio summary

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [NextAuth.js](https://next-auth.js.org/) 
