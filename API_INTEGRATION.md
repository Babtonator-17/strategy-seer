# Strategy Seer - API Integration Documentation

## 🔑 Required API Keys

All API keys must be configured in **Supabase Edge Function Secrets** for security.

### Primary APIs

1. **OPENROUTER_API_KEY** ✅ Configured
   - Primary AI model: DeepSeek Qwen3 8B
   - Fallback models: Mistral 8x7B, Llama-3
   - Used for: AI chat assistant, market analysis, trading advice

2. **ALPHA_VANTAGE_API_KEY** ⚠️ Required
   - Free tier: 500 requests/day
   - Premium tier: Higher limits
   - Used for: Stock quotes, forex rates, time-series data, news sentiment
   - Get key: https://www.alphavantage.co/support/#api-key

3. **FINNHUB_API_KEY** ⚠️ Required  
   - Free tier: 60 calls/minute
   - Used for: Real-time quotes, crypto data, earnings, insider trading
   - Get key: https://finnhub.io/register

4. **NEWS_API_KEY** ⚠️ Required
   - Free tier: 1000 requests/month
   - Used for: Financial news headlines, market sentiment
   - Get key: https://newsapi.org/register

### Fallback APIs

5. **Yahoo Finance** ✅ Enabled (Free)
   - No API key required
   - Rate limited but reliable
   - Used as: Universal fallback for all market data

## 🎯 API Integration Status

### ✅ **1. Alpha Vantage Integration**
- **Purpose**: Primary source for stocks, forex, time-series data
- **Endpoints Used**:
  - `GLOBAL_QUOTE` - Real-time stock quotes
  - `CURRENCY_EXCHANGE_RATE` - Forex rates  
  - `TIME_SERIES_INTRADAY` - Intraday charts (1D view)
  - `TIME_SERIES_DAILY` - Daily charts (1W, 1M view)
  - `TIME_SERIES_WEEKLY` - Weekly charts (1Y view)
  - `NEWS_SENTIMENT` - News with sentiment analysis
- **Fallback**: Finnhub → Yahoo Finance → Demo data
- **Error Handling**: Graceful degradation to next API

### ✅ **2. NewsAPI Integration**  
- **Purpose**: Financial news headlines and market context
- **Categories Supported**:
  - General trading news
  - Crypto-specific news
  - Forex market news
  - Stock market news
  - Commodities news
- **Features**:
  - Automatic sentiment analysis
  - Instrument extraction from headlines
  - Real-time news feeds
- **Fallback**: Alpha Vantage News → Demo news data

### ✅ **3. Finnhub Integration**
- **Purpose**: Real-time quotes, crypto data, company fundamentals
- **Endpoints Used**:
  - `quote` - Real-time stock/crypto quotes
  - `earnings` - Earnings data
  - `insider-trading` - Insider transaction data
  - `company-profile` - Company fundamentals
- **Crypto Mapping**:
  - `BTCUSD` → `BINANCE:BTCUSDT`
  - `ETHUSD` → `BINANCE:ETHUSDT`
- **Fallback**: Yahoo Finance → Demo data

### ✅ **4. Yahoo Finance Integration**
- **Purpose**: Universal fallback for all market data
- **Symbol Mapping**:
  - `BTCUSD` → `BTC-USD`
  - `ETHUSD` → `ETH-USD`
  - `EURUSD` → `EURUSD=X`
  - `XAUUSD` → `GC=F` (Gold futures)
  - `USOIL` → `CL=F` (Crude oil futures)
- **Features**: 
  - Free but rate-limited
  - Comprehensive coverage
  - Chart data available
- **Error Handling**: Returns demo data if all APIs fail

### ✅ **5. OpenRouter (AI) Integration**
- **Primary Model**: `deepseek/deepseek-chat`
- **Fallback Models**: 
  1. `mistralai/mistral-8x7b-instruct`
  2. `meta-llama/llama-3-8b-instruct`
- **Features**:
  - Market context integration
  - News sentiment integration  
  - Technical analysis aware
  - Trade execution commands
  - Conversation persistence

## 🔄 Demo vs Live Mode

### Demo Mode
- Uses realistic mock data
- No API calls made
- Safe for testing and onboarding
- Data updates every 30 seconds
- Includes realistic price variations

### Live Mode  
- Real API calls to configured services
- Fallback chain: Primary → Secondary → Demo
- API status monitoring
- Usage tracking and rate limiting
- Error logging and recovery

## 📊 Edge Functions

### `/market-data`
```bash
# Get comprehensive market data
curl -X GET "https://[project-id].supabase.co/functions/v1/market-data?symbols=BTCUSD,ETHUSD,EURUSD&accountType=live&type=all"

# Get specific data type
curl -X GET "https://[project-id].supabase.co/functions/v1/market-data?symbols=BTCUSD&accountType=live&type=price"

# Get news only
curl -X GET "https://[project-id].supabase.co/functions/v1/market-data?accountType=live&type=news&newsCategory=crypto"
```

### `/ai-chat`  
```bash
# Chat with market context
curl -X POST "https://[project-id].supabase.co/functions/v1/ai-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [user-token]" \
  -d '{
    "query": "What is the current Bitcoin trend?",
    "controlMode": false,
    "accountType": "live",
    "marketContextData": {...}
  }'
```

### `/trade-execution`
```bash
# Execute demo trade
curl -X POST "https://[project-id].supabase.co/functions/v1/trade-execution/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [user-token]" \
  -d '{
    "action": "buy",
    "symbol": "BTCUSD", 
    "amount": 0.1,
    "price": 42000,
    "accountType": "demo"
  }'

# Get portfolio summary
curl -X GET "https://[project-id].supabase.co/functions/v1/trade-execution/portfolio" \
  -H "Authorization: Bearer [user-token]"
```

## 🚨 Error Handling & Fallbacks

### Comprehensive Fallback Chain
1. **Primary API** (Alpha Vantage, NewsAPI, Finnhub)
2. **Secondary API** (Alternative provider)  
3. **Yahoo Finance** (Universal fallback)
4. **Demo Data** (Always available)

### Error Response Format
```json
{
  "success": false,
  "error": "API error description",
  "fallback_used": "yahoo_finance",
  "data": {...},
  "apis_status": {
    "alpha_vantage": false,
    "finnhub": true,
    "news_api": false,
    "yahoo_finance": true
  }
}
```

## 🔒 Security Implementation

### ✅ API Key Security
- All keys stored in Supabase Edge Function secrets
- No keys exposed in frontend code
- Environment variable isolation
- Automatic key rotation support

### ✅ Rate Limiting
- Intelligent request batching
- Cache implementation (30-second intervals)
- API usage monitoring
- Graceful degradation

### ✅ Data Validation
- Input sanitization
- Symbol validation
- Amount limits for trades
- Authentication checks

## 📈 Performance Optimizations

### Caching Strategy
- **Demo Data**: 30-second cache
- **Market Data**: Real-time with 15-second cache
- **News Data**: 5-minute cache
- **Technical Analysis**: 1-minute cache

### Request Batching
- Multiple symbols in single request
- Parallel API calls where possible
- Smart fallback ordering
- Minimum delay between requests

## 🧪 Testing

### Test Commands
```bash
# Test all APIs in demo mode
curl -X GET "https://[project-id].supabase.co/functions/v1/market-data?accountType=demo&type=all"

# Test live mode with fallbacks
curl -X GET "https://[project-id].supabase.co/functions/v1/market-data?accountType=live&symbols=BTCUSD,AAPL,EURUSD"

# Test AI chat
curl -X POST "https://[project-id].supabase.co/functions/v1/ai-chat" \
  -H "Content-Type: application/json" \
  -d '{"query": "Test message", "accountType": "demo"}'

# Test trade execution
curl -X POST "https://[project-id].supabase.co/functions/v1/trade-execution/execute" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "buy",
    "symbol": "BTCUSD",
    "amount": 0.01,
    "accountType": "demo"
  }'
```

## 🚀 Next Steps

### Immediate Actions Required:
1. **Configure API Keys** in Supabase Edge Function Secrets:
   - `ALPHA_VANTAGE_API_KEY`
   - `FINNHUB_API_KEY` 
   - `NEWS_API_KEY`

2. **Test All Integrations**:
   - Run test commands above
   - Verify fallback chains work
   - Test demo vs live mode switching

3. **Monitor API Usage**:
   - Track API call volumes
   - Monitor rate limits
   - Set up alerts for failures

### Future Enhancements:
- Additional news sources (Bloomberg API, Reuters)
- More sophisticated sentiment analysis
- Real broker API integrations (Interactive Brokers, TD Ameritrade)
- Advanced technical indicators
- Machine learning price predictions
- WebSocket real-time data streams

### 📋 Deployment Checklist

- [x] Edge functions deployed
- [x] Error handling implemented  
- [x] Fallback chains configured
- [x] Security measures in place
- [ ] API keys configured
- [ ] Live testing completed
- [ ] Monitoring set up
- [ ] Documentation reviewed

---

**All integrations are production-ready once API keys are configured.** 
The system gracefully handles missing keys by falling back to demo mode.