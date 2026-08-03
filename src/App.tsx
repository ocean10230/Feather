import "./App.css"
import { AnimatePresence, motion, useSpring, useTransform, type Easing } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "./Components"

const ease: Easing = [0,0,0,1]

function AnimatedNumber({ value, duration }: { value: number, duration?: number }) {
  const spring = useSpring(0, { bounce: 0, duration: duration || 1200 })
  const rounded = useTransform(spring, (latest) => Math.floor(latest).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{rounded}</motion.span>
}

export const Tracking = ({ title, unit, value, idx, onClick }: { onClick?: () => void, idx: number, title: string, unit: string, value: string | number | boolean | null | undefined }) => {
  // Check if the value is a valid number for animation
  const isNumeric = typeof value === 'number' && !isNaN(value)

  return (
    <div className={"duration-120 ease-out transition-colors flex flex-col gap-1 bg-[#0f1729] px-3 pb-3.75 pt-3.5 " + (typeof onClick === 'function' ? "cursor-pointer hover:bg-[color-mix(in_srgb,var(--bg),#ffffff_2%)]" : "")} onClick={onClick}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.2, duration: 0.3, ease }}>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#69769a]">{title}</div>
        <div className={"w-fit font-display text-[22px] font-bold text-transparent " + (idx === 0 ? "bg-linear-to-r from-(--accent) via-(--accent-secondary) to-(--accent-secondary) bg-clip-text" : "text-white")}>
          {/* Animate if numeric, otherwise fallback to standard string rendering */}
          {isNumeric ? <AnimatedNumber value={value} /> : String(value ?? '')}
          
          {unit && (
            <span className="text-[14px] font-light text-[#69769a] ml-0.5">
              {unit}
            </span>
          )}
        </div>
      </motion.div>
    </div>
  )
}

const Track = ({ pct }: { pct: number }) => (
  <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#141f38]">
    <motion.div
      className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-(--accent) to-(--accent-secondary) shadow-[0_0_10px_0_rgba(47,224,255,0.5)]"
      animate={{ width: `${pct}%` }}
      initial={{ width: "0%" }}
      transition={{ duration: 0.5, ease }}
    />
  </div>
);

const Overlay = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.1, ease }}
  onClick={onClose}
  className="absolute top-0 left-0 inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
>
  <div className="w-full h-full flex flex-col items-center justify-center">
    <div onClick={(e) => e.stopPropagation()} className="transition-all duration-150 ease-out w-7/8 bg-(--bg) border-(--border) border rounded-xl p-3 flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2 justify-between w-full">
        <span className="font-bold text-[17px] tracking-[-0.02em]">{title}</span>
        <div onClick={onClose} className="cursor-pointer rounded-full p-1 hover:bg-[color-mix(in_srgb,var(--bg),#ffffff_5%)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </div>
      </div>
      {children}
    </div>
  </div>
</motion.div>

const PointStat = ({ title, value, idx }: { title: string, value: number, idx: number }) => (
  <div className="p-1.5 flex-col flex items-center justify-center border border-(--border) rounded-lg">
    <span className="font-bold">{title}</span>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + idx * 0.2, duration: 0.3, ease: [0,0,0,1] }}
    >
      <AnimatedNumber value={value} duration={1000 + idx * 200} />
    </motion.div>
  </div>
)

const PointOverlay = () => (<div className="w-full">
  <div className="text-md leading-[1.2em]">
    Your full statistics related to points can be seen here
  </div>

  <div className="mt-5 grid grid-cols-2 gap-1 border-[#1e2a45] tracking-[-0.03em] leading-[1.2em]">
    <PointStat title="Today" value={2819} idx={0} />

    <PointStat title="Monthly" value={28193} idx={1} />

    <PointStat title="Yearly" value={281935} idx={2} />

    <PointStat title="Lifetime" value={2812923} idx={3} />
  </div>

  <PointStat title="Automated" value={583291} idx={4} />
</div>)

const App = () => {
  const [overlay, setOverlay] = useState<React.ReactNode | null>(null)
  const [overlayTitle, setOverlayTitle] = useState("")

  return (
    <div className="select-none font-sans text-white">
      <div className="relative w-80 overflow-hidden border border-[#1e2a45] bg-[radial-gradient(120%_160%_at_15%_-10%,#16233f_0%,#070b15_55%)] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]">
        <AnimatePresence>
          {overlay && <Overlay title={overlayTitle} onClose={() => setOverlay(null)}>{overlay}</Overlay>}
        </AnimatePresence>

        <Header />

        {/* Overview: Streak / Points / Stamps */}
        <div className="grid grid-cols-2 gap-px border-b border-[#1e2a45] bg-[#1e2a45]">
          <Tracking idx={0} title="Points" unit="pts" value={2480} onClick={() => {
            setOverlayTitle("Points Breakdown")
            setOverlay(<PointOverlay />)
          }} />
          <Tracking idx={1} title="Streak" unit="d" value={12} />
        </div>

        {/* Today */}
        <div className="px-5 pt-4.5">
          <div className="mb-1 flex items-center justify-between font-display text-md font-semibold">
            Automation summary
          </div>

          <div className="flex items-center gap-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#1e2a45] bg-[#141f38]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M4 12h16M4 12l4-4M4 12l4 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-baseline justify-between">
                <span className="text-xs font-semibold">Offers <span className="text-[#69769a]">(30 pts)</span></span>
                <span className="font-mono text-[11.5px] text-[#69769a]">
                  <b className="font-semibold text-(--text-neon)">1</b> / 5
                </span>
              </div>

              <div className="flex gap-1">
                {[1].map((d) => (
                  <div key={d} className="flex h-2 flex-1 items-center justify-center rounded-md bg-linear-to-b from-(--accent) to-(--accent-secondary) p-1">
                  </div>
                ))}

                {[2, 3, 4, 5].map((d) => (
                  <div key={d} className="flex h-2 flex-1 items-center justify-center rounded-md bg-(--disabled-bg) border border-(--border) p-1">
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-(--border) py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#1e2a45] bg-[#141f38]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
                <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12.5px] font-semibold">Searches</span>
                <span className="font-mono text-[11.5px] text-[#69769a]">
                  <b className="font-semibold text-(--text-neon)">24</b> / 30
                </span>
              </div>
              <Track pct={80} />
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-(--border) py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-(--border) bg-[#141f38]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-1 items-center justify-between gap-2.5">
              <div>
                <div className="mb-0.5 text-[12.5px] font-semibold">Claimed points</div>
                <div className="font-mono tracking-[-0.15px] text-[11.5px] text-[#758ac4]">
                  <b className="font-semibold text-(--text-neon)"><AnimatedNumber value={62} duration={2000} /> pts</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamps */}
        <div className="px-5 py-[20px]">
          <div className="mb-3 flex items-center justify-between font-display text-md font-semibold">
            <span>Stamps <span className="font-sans font-medium text-(--text-neon)">(1000 pts)</span></span>
            <span className="font-sans text-[11px] font-medium text-[#69769a]">6 of 8 collected</span>
          </div>
          <div className="grid grid-cols-12 gap-1 pb-1">
            {[1,1,1,1,0,0,0,0,0,0,0,0].map((filled, i) =>
              filled ? (
                <div
                  key={i}
                  className="aspect-square flex-1 rounded-sm bg-linear-to-br from-(--accent) to-(--accent-secondary) p-1 shadow-[0_0_12px_-2px_rgba(47,224,255,0.55)]"
                >
                </div>
              ) : (
                <div key={i} className="relative aspect-square flex-1 rounded-sm border border-(--border) bg-[#141f38]">
                  <div className="absolute left-1/2 top-1/2 size-1.25 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--disabled-bg)" />
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;