import { useState, useEffect, useCallback } from 'react'
import { getEvents } from '../api/events'
import EventCard from '../components/EventCard'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [slowLoad, setSlowLoad] = useState(false)
  const [error, setError] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setSlowLoad(false)
    setError('')

    // If the first load takes more than 3 seconds, show the Render cold start message
    const slowTimer = setTimeout(() => setSlowLoad(true), 3000)

    try {
      const res = await getEvents(page, 9)
      setEvents(res.events || res.rows || [])
      setPagination({
        total: res.total,
        page: res.page,
        totalPages: res.totalPages || Math.ceil(res.total / 9),
      })
    } catch (err) {
      setError(err.message)
    } finally {
      clearTimeout(slowTimer)
      setLoading(false)
      setSlowLoad(false)
    }
  }, [page])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Upcoming <span>Events</span></h1>
            <p className="page-subtitle">
              {pagination.total} event{pagination.total !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 24 }}>⚠ {error}</div>}

        {loading ? (
          <div className="spinner-center" style={{ flexDirection: 'column', gap: 16 }}>
            <div className="spinner" />
            {slowLoad && (
              <div className="cold-start-notice">
                ☕ The backend is on Render's free tier and is waking up from sleep.
                This only happens on the first load — usually takes 30–60 seconds.
              </div>
            )}
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎪</div>
            <div className="empty-title">No events yet</div>
            <div className="empty-desc">Check back soon for upcoming events</div>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <EventCard key={event.id} event={event} onBooked={fetchEvents} />
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
            >
              ← Prev
            </button>
            <span className="pagination-info">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}