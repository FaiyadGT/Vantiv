import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, Bookmark, Bot, ChevronDown, CircleHelp, Command, FileText, LayoutDashboard, Menu, MessageSquareText, Plus, Search, Settings2, ShieldAlert, Sparkles, TrendingUp, X } from 'lucide-react'

type Ticker = { symbol: string; name: string; price: string; change: string; positive: boolean; points: string }
const sampleStocks: Ticker[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: '$142.87', change: '+2.41%', positive: true, points: '0,38 12,33 24,36 36,22 48,27 60,16 72,20 84,9 96,13 108,2' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$247.04', change: '+0.82%', positive: true, points: '0,27 12,32 24,22 36,25 48,14 60,21 72,11 84,15 96,6 108,10' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: '$338.23', change: '-1.26%', positive: false, points: '0,8 12,15 24,11 36,27 48,19 60,30 72,24 84,38 96,33 108,44' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$425.22', change: '+1.13%', positive: true, points: '0,36 12,30 24,34 36,22 48,28 60,14 72,19 84,11 96,15 108,5' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: '$222.11', change: '+0.57%', positive: true, points: '0,29 12,23 24,28 36,18 48,20 60,13 72,16 84,8 96,12 108,6' },
]
const navItems = [
  { label: 'Overview', icon: LayoutDashboard }, { label: 'Research', icon: Sparkles }, { label: 'Watchlists', icon: Bookmark },
  { label: 'Monitoring', icon: Activity, badge: '3' }, { label: 'Reports', icon: FileText },
]

function Chart({ large = false }: { large?: boolean }) {
  const points = large ? '0,130 35,120 70,126 105,98 140,109 175,88 210,96 245,65 280,78 315,53 350,68 385,44 420,58 455,31 490,41 525,14 560,32 595,6 630,20 665,2' : '0,38 12,33 24,36 36,22 48,27 60,16 72,20 84,9 96,13 108,2'
  return <svg viewBox={large ? '0 0 665 145' : '0 0 108 48'} preserveAspectRatio="none" className={large ? 'chart-svg chart-large' : 'chart-svg'} aria-hidden="true"><defs><linearGradient id={large ? 'chartFillLarge' : 'chartFill'} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b8e963" stopOpacity=".2"/><stop offset="100%" stopColor="#b8e963" stopOpacity="0"/></linearGradient></defs><polygon points={`${points} ${large ? '665,145 0,145' : '108,48 0,48'}`} fill={`url(#${large ? 'chartFillLarge' : 'chartFill'})`}/><polyline points={points} fill="none" stroke="#c7f36b" strokeWidth={large ? '2.2' : '2'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/></svg>
}

function App() {
  const [active, setActive] = useState('Overview')
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
        setWatchlist(items.map((item: { symbol: string; company_name: string }) => ({ symbol: item.symbol, name: item.company_name || item.symbol, price: '—', change: '—', positive: true, points: '0,28 15,24 30,25 45,17 60,22 75,10 90,14 108,7' })))
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
      setWatchlist((current) => [{ symbol: normalized, name: company.trim() || normalized, price: '—', change: '—', positive: true, points: '0,28 15,24 30,25 45,17 60,22 75,10 90,14 108,7' }, ...current.filter((item) => item.symbol !== normalized)])
      setNotice(`${normalized} added to your watchlist.`)
      setModalOpen(false); setSymbol(''); setCompany('')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'API is unavailable. Start the VANTIV services to save watchlist changes.')
    }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <a className="wordmark" href="#overview"><span className="brand-glyph"><i/><i/><i/><i/></span><span>VANTIV<span className="wordmark-sub">INTELLIGENCE</span></span></a>
      <button className="workspace-switch"><span className="workspace-avatar">V</span><span className="workspace-copy"><b>My workspace</b><small>Free plan</small></span><ChevronDown size={14}/></button>
      <div className="nav-caption">WORKSPACE</div>
      <nav className="side-nav">{navItems.map(({ label, icon: Icon, badge }) => <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setMobileNav(false) }}><Icon size={16}/><span>{label}</span>{badge && <span className="nav-badge">{badge}</span>}</button>)}</nav>
      <div className="nav-caption tools-caption">YOUR TOOLS</div>
      <button className="nav-item" onClick={() => { setActive('AI Analyst'); setMobileNav(false) }}><Bot size={16}/><span>AI analyst</span><span className="new-dot"/></button>
      <div className="sidebar-bottom"><div className="usage-card"><div className="usage-row"><span>Research credits</span><span>4 / 10</span></div><div className="usage-track"><i/></div><p>Resets in 12 days <a href="#plans">Upgrade ↗</a></p></div><button className="nav-item"><Settings2 size={16}/><span>Settings</span></button><button className="nav-item"><CircleHelp size={16}/><span>Help center</span></button><div className="profile"><div className="profile-avatar">AL</div><div className="profile-info"><b>Alex Morgan</b><small>alex.morgan@email.com</small></div><MoreIcon/></div></div>
    </aside>
    {mobileNav && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={19}/></button><div className="breadcrumb">Workspace <span>/</span> <b>{active}</b></div></div><div className="topbar-actions"><div className="market-status"><span/> US MARKET <i>OPEN</i></div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17}/><i/></button><div className="top-divider"/><button className="command-button"><Command size={13}/><span>⌘ K</span></button></div></header>
      <div className="content">
        <div className="page-heading"><div><div className="date-line">{date}<span className="demo-pill"><i/> SAMPLE DATA</span></div><h1>Good morning, Alex <span className="wave">✳</span></h1><p className="heading-sub">Here’s what’s happening across your market today.</p></div><button className="primary-button" onClick={() => setActive('AI Analyst')}><Sparkles size={15}/> Ask VANTIV <span className="button-shortcut">↗</span></button></div>
        <div className="demo-banner"><div className="banner-icon"><Activity size={15}/></div><p><b>Preview workspace</b><span>Market figures and activity below are illustrative. Connect a market data provider to see live intelligence.</span></p><button onClick={() => setNotice('Market data integration is part of Phase 2.')}>Learn more <span>↗</span></button></div>
        <section className="metric-grid" aria-label="Market overview"><Metric label="S&P 500" value="5,842.47" change="+0.68%" positive/><Metric label="NASDAQ" value="18,847.28" change="+1.24%" positive/><Metric label="DOW JONES" value="42,544.22" change="−0.12%" positive={false}/><Metric label="VIX" value="18.42" change="−3.16%" positive/></section>
        <div className="dashboard-grid"><section className="panel market-panel"><div className="panel-heading"><div><div className="panel-eyebrow">MARKET PULSE <span className="live-dot"/></div><h2>Market overview</h2></div><button className="select-button">S&amp;P 500 <ChevronDown size={13}/></button></div><div className="market-value-row"><div><span className="big-value">5,842.47</span><span className="market-change"><ArrowUpRight size={14}/> 39.63 (0.68%)</span></div><div className="range-tabs"><button>1D</button><button>1W</button><button className="selected">1M</button><button>3M</button><button>1Y</button><button>ALL</button></div></div><div className="chart-wrap"><div className="chart-y-labels"><span>5,900</span><span>5,850</span><span>5,800</span><span>5,750</span></div><div className="chart-main"><div className="chart-grid-lines"><i/><i/><i/><i/></div><Chart large/><div className="chart-x-labels"><span>May 01</span><span>May 07</span><span>May 13</span><span>May 19</span><span>May 24</span><span>May 30</span></div></div></div><div className="chart-footer"><span><i className="legend-dot"/> S&amp;P 500</span><span>Illustrative performance</span></div></section>
        <section className="panel watch-panel"><div className="panel-heading"><div><div className="panel-eyebrow">YOUR TRACKED ASSETS</div><h2>Watchlist <span className="count-pill">{watchlist.length}</span></h2></div><button className="icon-button add-button" aria-label="Add to watchlist" onClick={() => setModalOpen(true)}><Plus size={17}/></button></div><div className="watch-table"><div className="table-head"><span>ASSET</span><span>PRICE</span><span>CHANGE</span></div>{watchlist.slice(0, 5).map((stock) => <div className="watch-row" key={stock.symbol}><div className="stock-id"><div className={`stock-icon ${stock.symbol.toLowerCase()}`}>{stock.symbol.slice(0,1)}</div><div><b>{stock.symbol}</b><small>{stock.name}</small></div></div><div className="stock-price">{stock.price}</div><div className={`stock-change ${stock.positive ? 'up' : 'down'}`}><span>{stock.change}</span><svg viewBox="0 0 108 48" preserveAspectRatio="none"><polyline points={stock.points}/></svg></div></div>)}</div><button className="text-button" onClick={() => setActive('Watchlists')}>View all watchlists <span>→</span></button></section>
        </div>
        <div className="lower-grid"><section className="panel insight-panel"><div className="section-heading"><div className="section-icon violet"><Sparkles size={15}/></div><div><div className="panel-eyebrow">VANTIV INTELLIGENCE</div><h2>What matters today</h2></div><span className="preview-tag">PREVIEW</span></div><div className="insight-content"><div className="insight-type"><span className="insight-bullet"/> MARKET SIGNAL <span>·</span> 18 MIN AGO</div><h3>Semiconductor momentum builds ahead of key earnings</h3><p>Chipmakers are outperforming the broader market as investors position ahead of upcoming earnings. NVIDIA and peers are seeing elevated volume relative to their 30-day averages.</p><div className="insight-tags"><span>NVDA</span><span>AMD</span><span>SEMICONDUCTORS</span></div><button className="text-button" onClick={() => setActive('Research')}>Explore this signal <span>→</span></button></div><div className="insight-footer"><ShieldAlert size={13}/> Illustrative insight. Not investment advice.</div></section>
          <section className="panel activity-panel"><div className="section-heading"><div className="section-icon blue"><Activity size={15}/></div><div><div className="panel-eyebrow">YOUR AGENT</div><h2>Recent activity</h2></div><button className="more-button" aria-label="More activity options">···</button></div><div className="activity-list"><ActivityItem icon={<Search size={14}/>} tint="green" title="Market scan completed" detail="Large-cap watchlist · 12 companies" time="9:42 AM"/><ActivityItem icon={<MessageSquareText size={14}/>} tint="violet-bg" title="New signal detected" detail="NVDA · Unusual trading volume" time="9:18 AM"/><ActivityItem icon={<FileText size={14}/>} tint="blue-bg" title="Research brief ready" detail="Apple Inc. · Q2 outlook" time="Yesterday"/></div><button className="text-button activity-link" onClick={() => setActive('Monitoring')}>View agent activity <span>→</span></button></section></div>
        <footer className="page-footer"><span>VANTIV <i>·</i> MARKET INTELLIGENCE, WORKING FOR YOU.</span><span className={`api-indicator ${apiState}`}><i/>{apiState === 'online' ? 'API CONNECTED' : apiState === 'checking' ? 'CONNECTING TO API' : 'API OFFLINE'} <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer">API DOCS ↗</a></span></footer>
        {notice && <div className="toast"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={14}/></button></div>}
      </div>
    </main>
    {modalOpen && <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setModalOpen(false) }}><form className="modal" onSubmit={addTicker}><div className="modal-header"><div><div className="panel-eyebrow">WATCHLIST</div><h2>Add an asset</h2></div><button type="button" className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close"><X size={17}/></button></div><label>Stock symbol<input autoFocus placeholder="e.g. NVDA" value={symbol} onChange={(event) => setSymbol(event.target.value)} required maxLength={12}/></label><label>Company name <span>OPTIONAL</span><input placeholder="e.g. NVIDIA Corporation" value={company} onChange={(event) => setCompany(event.target.value)} maxLength={120}/></label><p>Watchlist changes are saved to your VANTIV workspace database.</p><button className="primary-button" type="submit"><Plus size={15}/> Add to watchlist</button></form></div>}
  </div>
}

function Metric({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) { return <div className="metric-card"><span className="metric-label">{label}</span><b>{value}</b><span className={`metric-change ${positive ? 'up' : 'down'}`}>{positive ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {change} <small>today</small></span><div className="metric-spark"><Chart/></div></div> }
function ActivityItem({ icon, tint, title, detail, time }: { icon: React.ReactNode; tint: string; title: string; detail: string; time: string }) { return <div className="activity-item"><div className={`activity-icon ${tint}`}>{icon}</div><div className="activity-copy"><b>{title}</b><span>{detail}</span></div><time>{time}</time></div> }
function MoreIcon() { return <button className="profile-more" aria-label="Profile options"><span/><span/><span/></button> }

export default App
