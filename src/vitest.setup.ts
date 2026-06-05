import '@testing-library/jest-dom/vitest'

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

vi.stubGlobal('IntersectionObserver', NoopObserver)
vi.stubGlobal('ResizeObserver', NoopObserver)

/* Reject any network call from tests so stray fetches surface loudly instead of hitting the wire. */
vi.stubGlobal('fetch', (input: RequestInfo | URL) => {
  const url = typeof input === 'string' ? input : input.toString()

  return Promise.reject(new Error(`Unmocked fetch: ${url}`))
})
