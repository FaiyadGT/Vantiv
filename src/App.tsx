import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, Bookmark, Bot, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Command, ExternalLink, FileText, LayoutDashboard, Menu, MessageSquareText, Moon, Plus, Search, Settings2, ShieldAlert, Sparkles, Sun, TrendingUp, X } from 'lucide-react'
import './learn.css'
import './theme.css'

type Ticker = { symbol: string; name: string; price: string; change: string; positive: boolean; points: string }
const sampleStocks: Ticker[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '$142.87', change: '+2.41%', positive: true, points: '0,38 12,33 24,36 36,22 48,27 60,16 72,20 84,9 96,13 108,2' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$247.04', change: '+0.82%', positive: true, points: '0,27 12,32 24,22 36,25 48,14 60,21 72,11 84,15 96,6 108,10' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: '$338.23', change: '-1.26%', positive: false, points: '0,8 12,15 24,11 36,27 48,19 60,30 72,24 84,38 96,33 108,44' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$425.22', change: '+1.13%', positive: true, points: '0,36 12,30 24,34 36,22 48,28 60,14 72,19 84,11 96,15 108,5' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: '$222.11', change: '+0.57%', positive: true, points: '0,29 12,23 24,28 36,18 48,20 60,13 72,16 84,8 96,12 108,6' },
]
const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Learn', icon: BookOpen }, { label: 'Research', icon: Sparkles }, { label: 'Watchlists', icon: Bookmark },
  { label: 'Monitoring', icon: Activity, badge: '3' }, { label: 'Reports', icon: FileText },
]

function Chart({ large = false }: { large?: boolean }) {
  const points = large ? '0,130 35,120 70,126 105,98 140,109 175,88 210,96 245,65 280,78 315,53 350,68 385,44 420,58 455,31 490,41 525,14 560,32 595,6 630,20 665,2' : '0,38 12,33 24,36 36,22 48,27 60,16 72,20 84,9 96,13 108,2'
  return <svg viewBox={large ? '0 0 665 145' : '0 0 108 48'} preserveAspectRatio="none" className={large ? 'chart-svg chart-large' : 'chart-svg'} aria-hidden="true"><defs><linearGradient id={large ? 'chartFillLarge' : 'chartFill'} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b8e963" stopOpacity=".2"/><stop offset="100%" stopColor="#b8e963" stopOpacity="0"/></linearGradient></defs><polygon points={`${points} ${large ? '665,145 0,145' : '108,48 0,48'}`} fill={`url(#${large ? 'chartFillLarge' : 'chartFill'})`}/><polyline points={points} fill="none" stroke="#c7f36b" strokeWidth={large ? '2.2' : '2'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg>
}

function App() {
  const [active, setActive] = useState('Overview')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('vantiv-theme') === 'dark' ? 'dark' : 'light')
  const [watchlist, setWatchlist] = useState<Ticker[]>(sampleStocks)
  const [apiState, setApiState] = useState<'checking' | 'online' | 'offline'>('checking')
  const [modalOpen, setModalOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [company, setCompany] = useState('')
  const [notice, setNotice] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const date = useMemo(() => new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()), [])

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then((data) => setApiState(data.services?.api === 'ok' ? 'online' : 'offline')).catch(() => setApiState('offline'))
    fetch('/api/watchlist').then((r) => r.ok ? r.json() : []).then((items) => {
      if (Array.isArray(items) && items.length) {
        setWatchlist(items.map((item: { symbol: string; company_name: string }) => ({ symbol: item.symbol, name: item.company_name || item.symbol, price: 'â€”', change: 'â€”', positive: true, points: '0,28 15,24 30,25 45,17 60,22 75,10 90,14 108,7' })))
      }
    }).catch(() => undefined)
  }, [])

  async function addTicker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalized = symbol.trim().toUpperCase()
    if (!normalized) return
    try {
      const response = await fetch('/api/watchlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: normalized, company_name: company.trim() }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.detail || 'Could not add symbol.')
      setWatchlist((current) => [{ symbol: normalized, name: company.trim() || normalized, price: 'â€”', change: 'â€”', positive: true, points: '0,28 15,24 30,25 45,17 60,22 75,10 90,14 108,7' }, ...current.filter((item) => item.symbol !== normalized)])
      setNotice(`${normalized} added to your watchlist.`)
      setModalOpen(false); setSymbol(''); setCompany('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'API is unavailable. Start the VANTIV services to save watchlist changes.')
    }
  }

  function updateTheme(nextTheme: 'light' | 'dark') {
    setTheme(nextTheme)
    localStorage.setItem('vantiv-theme', nextTheme)
  }

  return <div className="app-shell" data-theme={theme}>
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <a className="wordmark" href="#overview"><span className="brand-glyph"><i/><i/><i/><i/></span><span>VANTIV<span className="wordmark-sub">INTELLIGENCE</span></span></a>
      <button className="workspace-switch"><span className="workspace-avatar">V</span><span className="workspace-copy"><b>My workspace</b><small>Free plan</small></span><ChevronDown size={14}/></button>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav">{navItems.map(({ label, icon: Icon, badge }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setMobileNav(false) }}><Icon size={16}/><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</button>)}</nav>
      <div className="nav-caption tools-caption">YOUR TOOLS</div>
      <button className="nav-item" onClick={() => { setActive('AI Analyst'); setMobileNav(false) }}><Bot size={16}/><span>AI analyst</span><span className="new-dot"/></button>
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-row"><span>Research credits</span><span>4 / 10</span></div><div className="usage-track"><i/></div><p>Resets in 12 days <a href="#plans">Upgrade â†—</a></p></div><button className={`nav-item ${active === 'Settings' ? 'active' : ''}`} onClick={() => { setActive('Settings'); setMobileNav(false) }}><Settings2 size={16}/><span>Settings</span></button><button className="nav-item"><CircleHelp size={16}/><span>Help center</span></button><div className="profile"><div className="profile-avatar">FC</div><div className="profile-info"><b>Faiyad Chowdhury</b><small>fc@email.com</small></div><MoreIcon/></div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div></div><div className="topbar-actions"><div className="market-status"><span/> US MARKET <i>OPEN</i></div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17}/><i/></button><div className="top-divider"/><button className="command-button"><Command size={13}/><span>âŒ˜ K</span></button></div></header>
      <div className="content">{active === 'Learn' ? <LearnCenter /> : active === 'Settings' ? <SettingsPanel theme={theme} onThemeChange={updateTheme} /> : <>
        <div className="page-heading"><div><div className="date-line">{date}<span className="demo-pill"><i/> SAMPLE DATA</span></div><h1>Good morning, Faiyad <span className="wave">âœ³</span></h1><p className="heading-sub">Hereâ€™s whatâ€™s happening across your market today.</p></div><button className="primary-button" onClick={() => setActive('AI Analyst')}><Sparkles size={15}/> Ask VANTIV <span className="button-shortcut">â†—</span></button></div>
        <div className="demo-banner"><div className="banner-icon"><Activity size={15}/></div><p><b>Preview workspace</b><span>Market figures and activity below are illustrative. Connect a market data provider to see live intelligence.</span></p><button onClick={() => setNotice('Market data integration is part of Phase 2.')}>Learn more <span>â†—</span></button></div>
        <section className="metric-grid" aria-label="Market overview"><Metric label="S&P 500" value="5,842.47" change="+0.68%" positive/><Metric label="NASDAQ" value="18,847.28" change="+1.24%" positive/><Metric label="DOW JONES" value="42,544.22" change="âˆ’0.12%" positive={false}/><Metric label="VIX" value="18.42" change="âˆ’3.16%" positive/></section>
        <div className="dashboard-grid"><section className="panel market-panel"><div className="panel-heading"><div><div className="panel-eyebrow">MARKET PULSE <span className="live-dot"/></div><h2>Market overview</h2></div><button className="select-button">S&amp;P 500 <ChevronDown size={13}/></button></div><div className="market-value-row"><div><span className="big-value">5,842.47</span><span className="market-change"><ArrowUpRight size={14}/> 39.63 (0.68%)</span></div><div className="range-tabs"><button>1D</button><button>1W</button><button className="selected">1M</button><button>3M</button><button>1Y</button><button>ALL</button></div></div><div className="chart-wrap"><div className="chart-y-labels"><span>5,900</span><span>5,850</span><span>5,800</span><span>5,750</span></div><div className="chart-main"><div className="chart-grid-lines"><i/><i/><i/><i/></div><Chart large/><div className="chart-x-labels"><span>May 01</span><span>May 07</span><span>May 13</span><span>May 19</span><span>May 24</span><span>May 30</span></div></div></div><div className="chart-footer"><span><i className="legend-dot"/> S&amp;P 500</span><span>Illustrative performance</span></div></section>
        <section className="panel watch-panel"><div className="panel-heading"><div><div className="panel-eyebrow">YOUR TRACKED ASSETS</div><h2>Watchlist <span className="count-pill">{watchlist.length}</span></h2></div><button className="icon-button add-button" aria-label="Add to watchlist" onClick={() => setModalOpen(true)}><Plus size={17}/></button></div><div className="watch-table"><div className="table-head"><span>ASSET</span><span>PRICE</span><span>CHANGE</span></div>{watchlist.slice(0, 5).map((stock) => <div className="watch-row" key={stock.symbol}><div className="stock-id"><div className={`stock-icon ${stock.symbol.toLowerCase()}`}>{stock.symbol.slice(0,1)}</div><div><b>{stock.symbol}</b><small>{stock.name}</small></div></div><div className="stock-price">{stock.price}</div><div className={`stock-change ${stock.positive ? 'up' : 'down'}`}><span>{stock.change}</span><svg viewBox="0 0 108 48" preserveAspectRatio="none"><polyline points={stock.points}/></svg></div></div>)}</div><button className="text-button" onClick={() => setActive('Watchlists')}>View all watchlists <span>â†’</span></button></section>
        </div>
        <div className="lower-grid"><section className="panel insight-panel"><div className="section-heading"><div className="section-icon violet"><Sparkles size={15}/></div><div><div className="panel-eyebrow">VANTIV INTELLIGENCE</div><h2>What matters today</h2></div><span className="preview-tag">PREVIEW</span></div><div className="insight-content"><div className="insight-type"><span className="insight-bullet"/> MARKET SIGNAL <span>Â·</span> 18 MIN AGO</div><h3>Semiconductor momentum builds ahead of key earnings</h3><p>Chipmakers are outperforming the broader market as investors position ahead of upcoming earnings. NVIDIA and peers are seeing elevated volume relative to their 30-day averages.</p><div className="insight-tags"><span>NVDA</span><span>AMD</span><span>SEMICONDUCTORS</span></div><button className="text-button" onClick={() => setActive('Research')}>Explore this signal <span>â†’</span></button></div><div className="insight-footer"><ShieldAlert size={13}/> Illustrative insight. Not investment advice.</div></section>
          <section className="panel activity-panel"><div className="section-heading"><div className="section-icon blue"><Activity size={15}/></div><div><div className="panel-eyebrow">YOUR AGENT</div><h2>Recent activity</h2></div><button className="more-button" aria-label="More activity options">Â·Â·Â·</button></div><div className="activity-list"><ActivityItem icon={<Search size={14}/>} tint="green" title="Market scan completed" detail="Large-cap watchlist Â· 12 companies" time="9:42 AM"/><ActivityItem icon={<MessageSquareText size={14}/>} tint="violet-bg" title="New signal detected" detail="NVDA Â· Unusual trading volume" time="9:18 AM"/><ActivityItem icon={<FileText size={14}/>} tint="blue-bg" title="Research brief ready" detail="Apple Inc. Â· Q2 outlook" time="Yesterday"/></div><button className="text-button activity-link" onClick={() => setActive('Monitoring')}>View agent activity <span>â†’</span></button></section></div>
        <footer className="page-footer"><span>VANTIV <i>Â·</i> MARKET INTELLIGENCE, WORKING FOR YOU.</span><span className={`api-indicator ${apiState}`}><i/>{apiState === 'online' ? 'API CONNECTED' : apiState === 'checking' ? 'CONNECTING TO API' : 'API OFFLINE'} <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API DOCS â†—</a></span></footer>
        {notice && <div className="toast"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14}/></button></div>}
      </>}
      </div>
    </main>
    {modalOpen && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}><form className="modal" onSubmit={addTicker}><div className="modal-header"><div><div className="panel-eyebrow">WATCHLIST</div><h2>Add an asset</h2></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close"><X size={17}/></button></div><label>Stock symbol<input autoFocus placeholder="e.g. NVDA" value={symbol} onChange={(event) => setSymbol(event.target.value)} required maxLength={12}/></label><label>Company name <span>OPTIONAL</span><input placeholder="e.g. NVIDIA Corporation" value={company} onChange={(event) => setCompany(event.target.value)} maxLength={120}/></label><p>Watchlist changes are saved to your VANTIV workspace database.</p><button className="primary-button" type="submit"><Plus size={15}/> Add to watchlist</button></form></div>}
  </div>
}

function Metric({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) { return <div className="metric-card"><span className="metric-label">{label}</span><b>{value}</b><span className={`metric-change ${positive ? 'up' : 'down'}`}>{positive ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {change} <small>today</small></span><div className="metric-spark"><Chart/></div></div> }
function ActivityItem({ icon, tint, title, detail, time }: { icon: React.ReactNode; tint: string; title: string; detail: string; time: string }) { return <div className="activity-item"><div className={`activity-icon ${tint}`}>{icon}</div><div className="activity-copy"><b>{title}</b><span>{detail}</span></div><time>{time}</time></div> }
function MoreIcon() { return <button className="profile-more" aria-label="Profile options"><span/><span/><span/></button> }

type Lesson = {
  id: string; path: string; title: string; minutes: number; level: string; description: string;
  sections: { heading: string; body: string }[]; takeaways: string[]; sources: { label: string; url: string }[]
}

const learningPaths = [
  { id: 'all', name: 'All topics', note: 'Explore the full library', icon: BookOpen },
  { id: 'investing', name: 'Investing basics', note: 'Start with the fundamentals', icon: Sparkles },
  { id: 'etfs', name: 'ETFs & funds', note: 'Understand pooled investments', icon: LayoutDashboard },
  { id: 'trading', name: 'Trading concepts', note: 'Orders, liquidity & risk', icon: TrendingUp },
  { id: 'research', name: 'Company research', note: 'Read the story behind a stock', icon: Search },
]

const lessons: Lesson[] = [
  { id: 'stock-basics', path: 'investing', title: 'Stocks: owning a piece of a company', minutes: 6, level: 'Beginner', description: 'Learn what a share represents and why stock prices move.', sections: [
    { heading: 'A share is a slice of ownership', body: 'When a company issues common stock, each share represents a fractional ownership interest. Shareholders may have voting rights and may receive dividends, but neither is guaranteed for every stock.' },
    { heading: 'Why prices move', body: 'Stock prices are set in markets where buyers and sellers meet. Expectations about a company, its industry, the economy, and investor sentiment can all affect demand and price. A rising price is not proof that a company is financially healthy.' },
    { heading: 'Understand the risk', body: 'A stock can lose value, and you can lose some or all of the money invested. Research the business, consider your time horizon and risk tolerance, and avoid treating past performance as a promise about future results.' },
  ], takeaways: ['A stock represents an ownership interest in a company.', 'Prices reflect changing supply, demand, and expectations.', 'Stocks carry risk, including the possibility of losing your investment.'], sources: [{ label: 'Investor.gov: Stocks', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks' }] },
  { id: 'etf-basics', path: 'etfs', title: 'ETFs: a basket you can trade', minutes: 7, level: 'Beginner', description: 'See how exchange-traded funds pool investments and trade.', sections: [
    { heading: 'One fund, many holdings', body: 'An ETF pools money from investors and holds a portfolio of assets according to its objectives. That portfolio might include stocks, bonds, or other investments. The fundâ€™s prospectus explains its strategy, holdings approach, risks, and costs.' },
    { heading: 'Exchange-traded during the day', body: 'ETF shares trade on an exchange throughout the trading day. Their market price can be above or below the fundâ€™s net asset value (NAV), which is calculated from the underlying holdings.' },
    { heading: 'A fund is not automatically diversified', body: 'A broad fund may hold many securities, but a narrowly focused fund can concentrate in one industry, theme, or asset. Check its holdings and investment objective instead of relying on the ETF label alone.' },
  ], takeaways: ['Review the fundâ€™s objective, holdings, and prospectus.', 'ETF market price can differ from NAV.', 'Narrowly focused ETFs may not provide broad diversification.'], sources: [{ label: 'Investor.gov: ETFs', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/mutual-funds-and-exchange-traded-2' }, { label: 'SEC: ETF characteristics', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-24' }] },
  { id: 'fees', path: 'etfs', title: 'ETF fees and the prospectus', minutes: 5, level: 'Beginner', description: 'Find common fund costs and where they are disclosed.', sections: [
    { heading: 'Costs affect returns', body: 'Funds have operating expenses and may have other shareholder or transaction costs. These expenses reduce the return investors receive. Compare funds using the fee table in each prospectus and look beyond a headline expense ratio.' },
    { heading: 'Where to look', body: 'A fundâ€™s prospectus includes standardized fee disclosures and describes its objectives, strategies, and risks. Brokerage or intermediary charges may be separate from fund operating expenses.' },
  ], takeaways: ['Fund expenses reduce the returns investors receive.', 'Read the prospectus fee table and risk disclosures.', 'Costs can come from the fund and from the brokerage account.'], sources: [{ label: 'SEC: Fund fees and expenses', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/mutual-fund-and-etf-fees-and-expenses-investor-bulletin' }] },
  { id: 'diversification', path: 'investing', title: 'Risk, time horizon & diversification', minutes: 8, level: 'Beginner', description: 'Explore ways investors think about risk and spreading exposure.', sections: [
    { heading: 'Risk depends on the goal', body: 'Investment risk includes the possibility that an investment loses value or that its return does not meet a goal. Time horizon, financial situation, and ability to tolerate losses matter when evaluating risk.' },
    { heading: 'Spread exposure thoughtfully', body: 'Diversification means spreading investments across assets and sectors. It can reduce the impact of one holding performing poorly, but it cannot guarantee a profit or prevent losses in a broad market decline.' },
    { heading: 'Look through funds', body: 'Owning multiple funds does not necessarily mean owning different underlying investments. Compare holdings, sectors, and asset classes to understand where exposures overlap.' },
  ], takeaways: ['Match risk considerations to the goal and time horizon.', 'Diversification can reduce concentration risk, not eliminate risk.', 'Check fund holdings for overlap.'], sources: [{ label: 'Investor.gov: Asset allocation & diversification', url: 'https://www.investor.gov/introduction-investing/getting-started/asset-allocation' }] },
  { id: 'orders', path: 'trading', title: 'Market orders and limit orders', minutes: 6, level: 'Beginner', description: 'Compare execution priority with price control.', sections: [
    { heading: 'Market orders', body: 'A market order generally prioritizes execution, but the execution price is not guaranteed. In a fast or thinly traded market, the final price can differ from the quote you saw when placing the order.' },
    { heading: 'Limit orders', body: 'A limit order sets the highest price you are willing to pay to buy, or the lowest price you are willing to accept to sell. It may not execute if the market does not reach your limit.' },
    { heading: 'Check the order details', body: 'Order behavior can depend on the order type, duration, venue, and market conditions. Make sure you understand the instructions shown by your brokerage before submitting an order.' },
  ], takeaways: ['Market orders do not guarantee a specific execution price.', 'Limit orders set a price boundary but may remain unfilled.', 'Order types can behave differently in fast-moving markets.'], sources: [{ label: 'FINRA: Order types', url: 'https://www.finra.org/investors/investing/investment-products/stocks/order-types' }, { label: 'FINRA: Market liquidity', url: 'https://syndication.finra.org/content/understanding-market-liquidity-and-your-investments' }] },
  { id: 'liquidity', path: 'trading', title: 'Liquidity, volume & the bid-ask spread', minutes: 5, level: 'Beginner', description: 'Understand how easy it may be to trade near a quoted price.', sections: [
    { heading: 'What liquidity means', body: 'Liquidity describes how readily an asset can be bought or sold near a fair market price. Trading volume is one clue about activity, but it does not guarantee that a large order can be filled without affecting price.' },
    { heading: 'The spread is a cost to notice', body: 'The bid is the highest displayed price buyers are offering and the ask is the lowest displayed price sellers are requesting. The difference is the bid-ask spread. A wider spread can make entering or exiting a position more costly.' },
  ], takeaways: ['Liquidity can vary by security and market conditions.', 'Volume alone does not capture all liquidity risk.', 'Pay attention to the bid-ask spread as well as the last-traded price.'], sources: [{ label: 'FINRA: Understanding market liquidity', url: 'https://syndication.finra.org/content/understanding-market-liquidity-and-your-investments' }] },
  { id: 'trading-risk', path: 'trading', title: 'Trading risk and common pitfalls', minutes: 8, level: 'Beginner', description: 'Build a checklist for volatility, leverage, and emotional decisions.', sections: [
    { heading: 'Volatility cuts both ways', body: 'A price that moves quickly can create gains or losses quickly. A plan should account for the possibility that a trade moves against you, gaps past a desired exit price, or cannot be closed at the price you expected.' },
    { heading: 'Know what leverage changes', body: 'Borrowing to invest or using leveraged products can magnify both gains and losses. You may lose more than your initial contribution in some leveraged arrangements. Understand the product and account terms before considering them.' },
    { heading: 'Slow down the decision', body: 'Avoid making decisions from a headline or a single chart pattern. Write down the reason for a trade, what would change your view, and the maximum loss you can accept before acting.' },
  ], takeaways: ['Fast price moves can make execution and losses less predictable.', 'Leverage increases exposure and can magnify losses.', 'A written thesis can help separate a plan from an impulse.'], sources: [{ label: 'Investor.gov: Investment products and risks', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products' }] },
  { id: 'filings', path: 'research', title: 'Start with company filings', minutes: 7, level: 'Beginner', description: 'Use primary documents to verify what a company reports.', sections: [
    { heading: 'What filings can tell you', body: 'Public companies file periodic reports and other disclosures. Annual and quarterly reports describe the business, financial results, risk factors, and managementâ€™s discussion. These documents are a useful starting point for company research.' },
    { heading: 'Read beyond the headline', body: 'Compare results across periods, note changes in reported risks, and check how management explains the numbers. A filing is not a forecast or a guarantee; it is one source to weigh alongside other evidence.' },
    { heading: 'Keep a source trail', body: 'Record the filing type, reporting period, and publication date. This helps distinguish current information from older material when reviewing a company over time.' },
  ], takeaways: ['Use company filings as primary-source material.', 'Compare periods and read reported risks, not just headlines.', 'Track the date and period for each source.'], sources: [{ label: 'SEC EDGAR company filings', url: 'https://www.sec.gov/edgar/search/' }] },
  { id: 'statements', path: 'research', title: 'A first look at financial statements', minutes: 9, level: 'Beginner', description: 'Learn what the income statement, balance sheet, and cash flow statement show.', sections: [
    { heading: 'Income statement', body: 'The income statement summarizes revenue, expenses, and profit or loss over a period. Compare trends and margins over time, and remember that accounting profit is not the same as cash generated.' },
    { heading: 'Balance sheet', body: 'The balance sheet reports assets, liabilities, and shareholdersâ€™ equity at a point in time. It can help you understand a companyâ€™s resources and obligations.' },
    { heading: 'Cash flow statement', body: 'The cash flow statement groups cash movements from operating, investing, and financing activities. Read the three statements together; no single line item tells the whole story.' },
  ], takeaways: ['The three statements describe different but connected views.', 'Compare figures over time and in context.', 'Financial statements are historical reporting, not a promise of future performance.'], sources: [{ label: 'SEC EDGAR company filings', url: 'https://www.sec.gov/edgar/search/' }] },
  { id: 'news-context', path: 'research', title: 'Put market news in context', minutes: 5, level: 'Beginner', description: 'Check sources, dates, and the difference between facts and interpretation.', sections: [
    { heading: 'Find the original source', body: 'When an article describes a company announcement, look for the original filing, earnings release, or transcript. Headlines can compress nuance, and summaries may omit important context.' },
    { heading: 'Separate fact from opinion', body: 'Identify which statements are reported facts, which are company guidance, and which are an authorâ€™s interpretation. Verify dates and reporting periods before comparing claims.' },
  ], takeaways: ['Verify important claims against original documents.', 'Check publication dates and reporting periods.', 'Treat commentary as interpretation, not confirmed fact.'], sources: [{ label: 'SEC EDGAR company filings', url: 'https://www.sec.gov/edgar/search/' }] },
]

type QuizQuestion = { prompt: string; options: string[]; answer: number; explanation: string }

const quizBank: Record<string, QuizQuestion[]> = {
  'stock-basics': [
    { prompt: 'What does a share of common stock represent?', options: ['A small ownership interest in a company', 'A guaranteed payment from a company', 'A loan that must be repaid on a set date'], answer: 0, explanation: 'Common stock represents an ownership interest. Dividends and gains are not guaranteed.' },
    { prompt: 'A stock rose over the past year. What can you conclude about next year?', options: ['It will rise by at least the same amount', 'Past performance alone cannot predict future returns', 'It cannot lose value now'], answer: 1, explanation: 'Past performance does not guarantee future results. A stock can rise or fall.' },
  ],
  'etf-basics': [
    { prompt: 'What does an ETF generally do?', options: ['Pool investor money into a portfolio of assets', 'Guarantee a fixed return', 'Hold only cash'], answer: 0, explanation: 'ETFs pool investorsâ€™ money into a portfolio. The assets and risks depend on the specific fund.' },
    { prompt: 'Can you assume every ETF is broadly diversified?', options: ['Yes, every ETF holds the whole market', 'No, some ETFs focus narrowly on a sector or theme', 'Yes, if it trades during the day'], answer: 1, explanation: 'Some ETFs are concentrated. Check the fundâ€™s holdings and investment objective.' },
  ],
  fees: [
    { prompt: 'Where can you find a fundâ€™s standardized fee disclosures?', options: ['In its prospectus fee table', 'Only in a daily price chart', 'Fees are never disclosed'], answer: 0, explanation: 'The prospectus includes a standardized fee table. Other brokerage charges may be separate.' },
    { prompt: 'What happens to returns when a fund has expenses?', options: ['Expenses can reduce the investorâ€™s return', 'Expenses increase the fundâ€™s return', 'Expenses only apply when the fund loses money'], answer: 0, explanation: 'Fund expenses are paid from fund assets or by investors and reduce returns.' },
  ],
  diversification: [
    { prompt: 'What is diversification intended to do?', options: ['Reduce concentration in one investment or area', 'Guarantee that a portfolio cannot lose money', 'Make every investment move the same way'], answer: 0, explanation: 'Diversification can reduce concentration risk, but it cannot guarantee a profit or prevent losses.' },
    { prompt: 'You own three funds. What is a useful next research step?', options: ['Assume they hold different companies', 'Compare their underlying holdings for overlap', 'Choose the fund with the highest recent return'], answer: 1, explanation: 'Funds can own many of the same securities. Comparing holdings helps reveal overlap.' },
  ],
  orders: [
    { prompt: 'What does a market order generally prioritize?', options: ['Execution, with no guaranteed exact price', 'A specific price, even if it never executes', 'A guaranteed profit'], answer: 0, explanation: 'A market order generally prioritizes execution. The final execution price can differ from the quote.' },
    { prompt: 'What is a trade-off of a limit order?', options: ['It may not execute if the market never reaches its limit', 'It always executes immediately', 'It guarantees the best available price'], answer: 0, explanation: 'A limit order sets a price boundary, but may remain unfilled.' },
  ],
  liquidity: [
    { prompt: 'What does a wider bid-ask spread usually signal?', options: ['A larger gap between displayed buyer and seller prices', 'A guaranteed price increase', 'That the asset has no risk'], answer: 0, explanation: 'The spread is the gap between the bid and ask. A wider spread can make trading more costly.' },
    { prompt: 'Does high trading volume guarantee that a large order will have no price impact?', options: ['Yes, volume eliminates liquidity risk', 'No, liquidity can vary and orders can still affect price', 'Yes, if the asset is an ETF'], answer: 1, explanation: 'Volume is only one clue. Liquidity and price impact also depend on conditions and order size.' },
  ],
  'trading-risk': [
    { prompt: 'What can leverage do to investment outcomes?', options: ['Magnify gains and losses', 'Remove the possibility of loss', 'Guarantee a fixed return'], answer: 0, explanation: 'Leverage increases exposure and can magnify losses as well as gains.' },
    { prompt: 'Which is a useful step before making a trade?', options: ['Write down the reason and what would change your view', 'Trade immediately after seeing a headline', 'Assume a stop price guarantees the final exit price'], answer: 0, explanation: 'A written thesis can help you make deliberate decisions. Execution prices are not always guaranteed.' },
  ],
  filings: [
    { prompt: 'What is a company filing useful for?', options: ['Reviewing company-reported results, risks, and disclosures', 'Knowing a stockâ€™s guaranteed future price', 'Replacing all other research'], answer: 0, explanation: 'Filings are primary-source disclosures, not forecasts or guarantees.' },
    { prompt: 'When comparing two company reports, what should you note?', options: ['The reporting period and publication date', 'Only the headline', 'The order in which search results appear'], answer: 0, explanation: 'Dates and reporting periods help keep comparisons accurate and current.' },
  ],
  statements: [
    { prompt: 'Which statement summarizes revenue and expenses over a period?', options: ['Income statement', 'Balance sheet', 'Watchlist'], answer: 0, explanation: 'The income statement reports revenue, expenses, and profit or loss over a period.' },
    { prompt: 'How should you read a companyâ€™s three main financial statements?', options: ['Together, because each shows a different connected view', 'Use just one and ignore the rest', 'As a guarantee of future performance'], answer: 0, explanation: 'Income, balance sheet, and cash flow statements provide complementary information.' },
  ],
  'news-context': [
    { prompt: 'A headline describes a major company announcement. What is a strong next step?', options: ['Look for the original filing or company release', 'Trade based only on the headline', 'Assume the headline includes every important detail'], answer: 0, explanation: 'Original documents help verify what was announced and provide context a headline may omit.' },
    { prompt: 'When reading commentary, what should you distinguish?', options: ['Reported facts from interpretation or opinion', 'The page color from the headline', 'Todayâ€™s price from a guaranteed future price'], answer: 0, explanation: 'Commentary is analysis. Separate it from reported facts and verify important claims.' },
  ],
}

function SettingsPanel({ theme, onThemeChange }: { theme: 'light' | 'dark'; onThemeChange: (theme: 'light' | 'dark') => void }) {
  return <div className="settings-page">
    <div className="settings-heading"><div className="learn-eyebrow"><Settings2 size={13}/> PREFERENCES</div><h1>Settings</h1><p>Make VANTIV feel right for you.</p></div>
    <section className="settings-card"><div className="settings-card-title"><div><h2>Appearance</h2><p>Choose how VANTIV looks on this browser.</p></div><span className="settings-current">{theme === 'dark' ? 'DARK MODE ON' : 'LIGHT MODE ON'}</span></div><div className="theme-choice-grid" role="group" aria-label="Color theme"><button className={`theme-choice ${theme === 'light' ? 'theme-choice-active' : ''}`} aria-pressed={theme === 'light'} onClick={() => onThemeChange('light')}><span className="theme-preview preview-light"><i/><i/><i/></span><span><b><Sun size={14}/> Light</b><small>Bright surfaces and dark text</small></span><span className="theme-radio"/></button><button className={`theme-choice ${theme === 'dark' ? 'theme-choice-active' : ''}`} aria-pressed={theme === 'dark'} onClick={() => onThemeChange('dark')}><span className="theme-preview preview-dark"><i/><i/><i/></span><span><b><Moon size={14}/> Dark</b><small>Dim surfaces and light text</small></span><span className="theme-radio"/></button></div><div className="settings-scope"><span className="scope-dot"/><p>This preference is saved in this browser only. It does not change your device theme or other users’ VANTIV settings.</p></div></section>
  </div>
}

function LearnCenter() {
  const [path, setPath] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('stock-basics')
  const [quizSelections, setQuizSelections] = useState<Record<string, number[]>>({})
  const [quizChecks, setQuizChecks] = useState<Record<string, boolean[]>>({})
  const [completed, setCompleted] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('vantiv-learning-completed') || '[]') as string[] } catch { return [] }
  })
  const filteredLessons = lessons.filter((lesson) => (path === 'all' || lesson.path === path) && `${lesson.title} ${lesson.description} ${lesson.path}`.toLowerCase().includes(query.toLowerCase()))
  const selectedLesson = filteredLessons.find((lesson) => lesson.id === selectedId) || filteredLessons[0]
  const selectedPath = learningPaths.find((item) => item.id === path)?.name || 'All topics'
  const questions = selectedLesson ? (quizBank[selectedLesson.id] || []).map((question) => {
    const shift = Array.from(question.prompt).reduce((sum, character) => sum + character.charCodeAt(0), 0) % question.options.length
    return { ...question, options: [...question.options.slice(shift), ...question.options.slice(0, shift)], answer: (question.answer - shift + question.options.length) % question.options.length }
  }) : []
  const answers = selectedLesson ? quizSelections[selectedLesson.id] || [] : []
  const checks = selectedLesson ? quizChecks[selectedLesson.id] || [] : []
  const correctCount = questions.filter((question, index) => checks[index] && answers[index] === question.answer).length
  const quizPassed = questions.length > 0 && correctCount === questions.length
  function markComplete() {
    if (!selectedLesson || !quizPassed || completed.includes(selectedLesson.id)) return
    const updated = [...completed, selectedLesson.id]
    setCompleted(updated)
    localStorage.setItem('vantiv-learning-completed', JSON.stringify(updated))
  }
  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (!selectedLesson) return
    const id = selectedLesson.id
    if (quizChecks[id]?.[questionIndex] && quizSelections[id]?.[questionIndex] === questions[questionIndex]?.answer) return
    setQuizSelections((current) => {
      const next = [...(current[id] || Array(questions.length).fill(-1))]
      next[questionIndex] = optionIndex
      return { ...current, [id]: next }
    })
    setQuizChecks((current) => {
      const next = [...(current[id] || Array(questions.length).fill(false))]
      next[questionIndex] = false
      return { ...current, [id]: next }
    })
  }
  function checkAnswer(questionIndex: number) {
    if (!selectedLesson || answers[questionIndex] === undefined || answers[questionIndex] < 0) return
    const id = selectedLesson.id
    setQuizChecks((current) => {
      const next = [...(current[id] || Array(questions.length).fill(false))]
      next[questionIndex] = true
      return { ...current, [id]: next }
    })
  }
  function choosePath(nextPath: string) {
    setPath(nextPath)
    const first = lessons.find((lesson) => nextPath === 'all' || lesson.path === nextPath)
    if (first) setSelectedId(first.id)
  }

  return <div className="learn-center">
    <div className="learn-hero"><div className="learn-hero-copy"><div className="learn-eyebrow"><BookOpen size={13}/> VANTIV LEARNING</div><h1>Understand the market.<br/><em>Build your own view.</em></h1><p>Clear, practical lessons on stocks, ETFs, trading, and company research. Learn the concepts, check the sources, and make your own decisions.</p></div><div className="learn-hero-side"><div className="learn-orbit orbit-a"/><div className="learn-orbit orbit-b"/><div className="learn-orbit-core"><BookOpen size={25}/></div><span className="learn-orbit-star">âœ³</span><div className="learning-count"><b>{completed.length}<small> / {lessons.length}</small></b><span>LESSONS COMPLETED</span></div></div></div>
    <div className="learn-tools"><div className="learn-section-label"><span>01</span> YOUR LEARNING PATH</div><label className="learn-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search lessons, topics, concepts"/><kbd>âŒ˜ K</kbd></label></div>
    <div className="learning-path-grid">{learningPaths.slice(1).map(({ id, name, note, icon: Icon }, index) => <button key={id} className={`learning-path-card ${path === id ? 'path-active' : ''}`} onClick={() => choosePath(id)}><span className={`path-icon path-icon-${index}`}><Icon size={16}/></span><span className="path-card-copy"><b>{name}</b><small>{note}</small></span><span className="path-count">{lessons.filter((lesson) => lesson.path === id).length} lessons</span><ChevronRight size={14} className="path-arrow"/></button>)}</div>
    <div className="learn-main-grid"><section className="lesson-list-panel"><div className="lesson-list-head"><div><div className="learn-section-label"><span>02</span> LESSON LIBRARY</div><h2>{selectedPath}</h2></div><span className="lesson-total">{filteredLessons.length} LESSONS</span></div><div className="lesson-list">{filteredLessons.map((lesson, index) => <button key={lesson.id} className={`lesson-row ${selectedLesson?.id === lesson.id ? 'lesson-selected' : ''}`} onClick={() => setSelectedId(lesson.id)}><span className={`lesson-number ${completed.includes(lesson.id) ? 'lesson-done' : ''}`}>{completed.includes(lesson.id) ? <Check size={13}/> : String(index + 1).padStart(2, '0')}</span><span className="lesson-row-copy"><b>{lesson.title}</b><small>{lesson.description}</small><span className="lesson-meta"><span>{lesson.level}</span><i/> <Clock3 size={11}/> {lesson.minutes} min</span></span><ChevronRight className="lesson-chevron" size={15}/></button>)}{filteredLessons.length === 0 && <div className="learn-empty">No lessons match that search. Try another topic.</div>}</div><div className="learning-note"><ShieldAlert size={13}/> Education only. Lessons do not provide personalized investment recommendations.</div></section>
      <section className="lesson-detail-panel">{selectedLesson ? <><div className="lesson-detail-top"><span className="lesson-kicker">{selectedPath.toUpperCase()} <i>Â·</i> {selectedLesson.level.toUpperCase()}</span><span className="lesson-duration"><Clock3 size={12}/> {selectedLesson.minutes} MIN READ</span></div><h2>{selectedLesson.title}</h2><p className="lesson-summary">{selectedLesson.description}</p><div className="lesson-rule"/>{selectedLesson.sections.map((section, index) => <article className="lesson-section" key={section.heading}><div className="lesson-section-num">0{index + 1}</div><div><h3>{section.heading}</h3><p>{section.body}</p></div></article>)}<div className="key-takeaways"><div className="takeaway-title"><Sparkles size={13}/> KEY TAKEAWAYS</div>{selectedLesson.takeaways.map((takeaway) => <div className="takeaway-row" key={takeaway}><Check size={13}/><span>{takeaway}</span></div>)}</div><div className="quiz-module"><div className="quiz-heading"><div><span>03 / ACTIVE RECALL</span><h3>Quick knowledge check</h3></div><span className="quiz-score">{correctCount} / {questions.length} CORRECT</span></div><p className="quiz-intro">Choose an answer, then check it. Missed one? Review the explanation and try again.</p>{questions.map((question, questionIndex) => { const choice = answers[questionIndex]; const checked = Boolean(checks[questionIndex]); const right = checked && choice === question.answer; return <article className="quiz-question" key={question.prompt}><div className="quiz-question-title"><span>{String(questionIndex + 1).padStart(2, '0')}</span><b>{question.prompt}</b></div><div className="quiz-options">{question.options.map((option, optionIndex) => <button type="button" key={option} className={`quiz-option ${choice === optionIndex ? 'quiz-option-selected' : ''} ${checked && optionIndex === question.answer ? 'quiz-option-correct' : ''} ${checked && choice === optionIndex && !right ? 'quiz-option-wrong' : ''}`} onClick={() => selectAnswer(questionIndex, optionIndex)}>{option}</button>)}</div>{checked && <div className={`quiz-feedback ${right ? 'feedback-correct' : 'feedback-try'}`}><b>{right ? 'Correct.' : 'Not quite.'}</b> {question.explanation}{!right && ' Select another answer to retry.'}</div>}<button type="button" className="quiz-check-button" disabled={choice === undefined || choice < 0 || checked} onClick={() => checkAnswer(questionIndex)}>{right ? 'Correct' : checked ? 'Choose a new answer' : 'Check answer'}</button></article>})}<div className={`quiz-gate ${quizPassed ? 'quiz-gate-passed' : ''}`}>{quizPassed ? 'Great work. You passed this lesson’s knowledge check.' : `Answer all ${questions.length} questions correctly to complete this lesson. ${correctCount} correct so far.`}</div></div><div className="lesson-sources"><span>LEARN MORE FROM PRIMARY SOURCES</span>{selectedLesson.sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>{source.label}<ExternalLink size={12}/></a>)}</div><div className="lesson-complete-row"><span>{completed.includes(selectedLesson.id) ? 'Lesson complete.' : quizPassed ? 'Knowledge check passed. Ready to finish?' : `Pass the quiz to finish (${correctCount}/${questions.length}).`}</span><button className={completed.includes(selectedLesson.id) ? 'complete-button is-complete' : 'complete-button'} onClick={markComplete} disabled={completed.includes(selectedLesson.id) || !quizPassed}><Check size={14}/>{completed.includes(selectedLesson.id) ? 'Completed' : quizPassed ? 'Complete lesson' : 'Quiz locked'}</button></div></> : <div className="learn-empty">Choose a lesson to get started.</div>}</section></div>
    <div className="learn-disclaimer">VANTIV Learn is for general education. It is not financial, tax, or investment advice. Investing and trading involve risk, including possible loss of principal. <a href="https://www.investor.gov/" target="_blank" rel="noreferrer">Investor.gov <ExternalLink size={10}/></a></div>
  </div>
}

export default App
