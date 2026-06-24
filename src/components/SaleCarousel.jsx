import { useRef, useEffect } from 'react'
import ProductCard from './ProductCard'

function SaleCarousel({ products }) {
  const ref = useRef(null)
  const paused = useRef(false)   // faqat barmoq bilan surganda
  const drag = useRef({ active: false, captured: false, startX: 0, startScroll: 0, moved: false, pointerId: null })
  const posRef = useRef(0)

  // Uzluksiz aylanish uchun 3 nusxa
  const base = products.length
    ? Array.from({ length: Math.max(6, products.length) }, (_, i) => products[i % products.length])
    : []
  const list = base.length ? [...base, ...base, ...base] : []

  // Boshlang'ich joylashuv — o'rta nusxa
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const id = requestAnimationFrame(() => {
      posRef.current = el.scrollWidth / 3
      el.scrollLeft = posRef.current
    })
    return () => cancelAnimationFrame(id)
  }, [list.length])

  // Avtomatik aylanish (kasrli pozitsiya — yumalash muammosi yo'q)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf
    let last = performance.now()
    const speed = 40 // px / sekund
    const tick = (now) => {
      const dt = now - last
      last = now
      const set = el.scrollWidth / 3
      if (paused.current || drag.current.active) {
        posRef.current = el.scrollLeft   // foydalanuvchi surdi — sinxron
      } else if (set > 0) {
        posRef.current += (speed * dt) / 1000
        if (posRef.current >= set * 2) posRef.current -= set
        else if (posRef.current < set) posRef.current += set
        el.scrollLeft = posRef.current
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [list.length])

  const wrapScroll = (el) => {
    const set = el.scrollWidth / 3
    if (set <= 0) return
    if (el.scrollLeft >= set * 2) el.scrollLeft -= set
    else if (el.scrollLeft < set) el.scrollLeft += set
  }

  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return   // barmoq — tabiiy scroll
    const el = ref.current
    drag.current = { active: true, captured: false, startX: e.clientX, startScroll: el.scrollLeft, moved: false, pointerId: e.pointerId }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.active) return
    const el = ref.current
    const dx = e.clientX - d.startX
    // Capture FAQAT haqiqatan surilganda (oddiy bosishni buzmaslik uchun)
    if (!d.moved && Math.abs(dx) > 4) {
      d.moved = true
      d.captured = true
      el.setPointerCapture?.(d.pointerId)
      el.classList.add('dragging')
    }
    if (d.moved) {
      el.scrollLeft = d.startScroll - dx
      wrapScroll(el)
    }
  }
  const endDrag = () => {
    const d = drag.current
    if (!d.active) return
    if (d.captured) ref.current?.releasePointerCapture?.(d.pointerId)
    ref.current?.classList.remove('dragging')
    d.active = false
    d.captured = false
  }
  // Sudragandan keyin tasodifan ochilmasligi uchun
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
      onTouchStart={() => { paused.current = true }}
      onTouchEnd={() => { paused.current = false }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
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
