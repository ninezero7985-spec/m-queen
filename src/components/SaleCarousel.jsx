import { useRef, useEffect } from 'react'
import ProductCard from './ProductCard'

function SaleCarousel({ products }) {
  const ref = useRef(null)
  const paused = useRef(false)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })

  // Mahsulotlarni ko'paytiramiz (uzluksiz aylanish uchun) — 3 nusxa
  const base = products.length
    ? Array.from({ length: Math.max(6, products.length) }, (_, i) => products[i % products.length])
    : []
  const list = base.length ? [...base, ...base, ...base] : []

  // Chekkaga yetganda sezilmasdan o'rtaga qaytarish (uzluksiz his)
  const wrap = (el) => {
    const set = el.scrollWidth / 3
    if (set <= 0) return
    if (el.scrollLeft >= set * 2) el.scrollLeft -= set
    else if (el.scrollLeft < set) el.scrollLeft += set
  }

  // Boshlang'ich joylashuv — o'rta nusxa
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = requestAnimationFrame(() => { el.scrollLeft = el.scrollWidth / 3 })
    return () => cancelAnimationFrame(id)
  }, [list.length])

  // Avtomatik aylanish
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf
    let last = performance.now()
    const speed = 32 // px / sekund (sekin)
    const tick = (now) => {
      const dt = now - last
      last = now
      if (!paused.current && !drag.current.active) {
        el.scrollLeft += (speed * dt) / 1000
        wrap(el)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [list.length])

  // Sichqoncha bilan sudrash
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') { paused.current = true; return }
    const el = ref.current
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    el.classList.add('dragging')
    el.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e) => {
    if (!drag.current.active) return
    const el = ref.current
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 3) drag.current.moved = true
    el.scrollLeft = drag.current.startScroll - dx
    wrap(el)
  }
  const onPointerUp = (e) => {
    if (e.pointerType !== 'mouse') { paused.current = false; return }
    if (drag.current.active) {
      drag.current.active = false
      ref.current?.classList.remove('dragging')
      ref.current?.releasePointerCapture?.(e.pointerId)
    }
  }
  // Sudragandan keyin tasodifan mahsulot ochilmasligi uchun
  const onClickCapture = (e) => {
    if (drag.current.moved) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = false
    }
  }

  if (!list.length) return null

  return (
    <div
      className="sale-scroller"
      ref={ref}
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => {
        paused.current = false
        if (drag.current.active) {
          drag.current.active = false
          ref.current?.classList.remove('dragging')
        }
      }}
      onTouchStart={() => { paused.current = true }}
      onTouchEnd={() => { paused.current = false }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClickCapture={onClickCapture}
    >
      <div className="sale-row">
        {list.map((p, i) => (
          <div className="sale-slide" key={i}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default SaleCarousel
