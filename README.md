# Bank Statement Analyzer



## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your OpenAI API key
```

## Configuration

Create a `.env` file with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4-turbo-preview
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=5242880
```

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Endpoints

### POST /api/analyze

Analyzes a bank statement CSV file and returns detailed financial insights.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `statement`
- File format: CSV

**Required CSV Format:**
```csv
date,description,amount,type,balance
2025-10-01,DIRECT DEPOSIT - STARTUP INC,2850.00,credit,2850.00
2025-10-02,SPOTIFY PREMIUM,-10.99,debit,2839.01
```

**Response:**
```json
{
  "summary": {
    "totalIncome": 9200.00,
    "totalExpenses": 7543.21,
    "netCashFlow": 1656.79,
    "periodStart": "2025-10-01",
    "periodEnd": "2025-12-31"
  },
  "categoryBreakdown": [...],
  "monthlyComparison": [...],
  "recurringExpenses": [...],
  "oneTimeExpenses": [...],
  "insights": [...]
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-28T10:30:00.000Z"
}
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "statement=@bank_statement.csv"
```

## Project Structure

```
├── src/
│   ├── config/
│   │   └── config.ts           # Environment configuration
│   ├── controllers/
│   │   └── analysisController.ts  # Request handlers
│   ├── middleware/
│   │   ├── errorHandler.ts     # Error handling
│   │   └── upload.ts           # File upload configuration
│   ├── routes/
│   │   └── index.ts            # API routes
│   ├── services/
│   │   ├── csvParser.ts        # CSV parsing logic
│   │   └── openai.ts           # OpenAI integration
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── index.ts                # Application entry point
├── optimized_prompt.txt        # Optimized AI prompt
├── .env.example                # Environment template
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

