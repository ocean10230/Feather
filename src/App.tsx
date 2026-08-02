import "./App.css"
import Icon from "../../rewards/public/icon.png"
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const check = (
  <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
    <path d="M5 13l4 4L19 7" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const bolt = (stroke: string, sw = 7) => (
  <svg viewBox="0 0 100 100" fill="none" className="h-full w-full">
    <path
      d="M78 15 L38 46 L58 44 L24 78 L34 55 L18 58 Z"
      stroke={stroke}
      strokeWidth={sw}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { bounce: 0, duration: 1200 })
  const rounded = useTransform(spring, (latest) => Math.floor(latest).toLocaleString())

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  return <motion.span>{rounded}</motion.span>
}

export const Tracking = ({ title, unit, value, idx }: { idx: number, title: string, unit: string, value: string | number | boolean | null | undefined }) => {
  // Check if the value is a valid number for animation
  const isNumeric = typeof value === 'number' && !isNaN(value)

  return (
    <div className="flex flex-col gap-1 bg-[#0f1729] px-3 pb-3.75 pt-3.5">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.2, duration: 0.3, ease: [0.0, 0.01, 0.01, 0.95] }}>
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#69769a]">{title}</div>
        <div className="font-display bg-linear-to-r from-[#2fe0ff] to-[#3d7bff] bg-clip-text text-[22px] font-bold text-transparent">
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
    <div
      className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-[#3d7bff] to-[#2fe0ff] shadow-[0_0_10px_0_rgba(47,224,255,0.5)]"
      style={{ width: `${pct}%` }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute -right-px top-1/2 h-3.5 w-3.5 -translate-y-1/2 drop-shadow-[0_0_3px_#8af1ff]"
      >
        <path d="M13 2L5 14h5l-1 8 9-12h-5l1-8z" fill="#8af1ff" />
      </svg>
    </div>
  </div>
);

const App = () => {
  return (
    <div className="flex justify-center bg-transparent p-6 font-sans text-white">
      <div className="w-100 overflow-hidden border border-[#1e2a45] bg-[radial-gradient(120%_160%_at_15%_-10%,#16233f_0%,#070b15_55%)] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e2a45] p-3">
          <div className="flex items-center gap-2.5">
            <img src={Icon} alt="Icon" className="size-8" />
            <div className="font-display text-2xl font-bold tracking-tight">Surge</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#1e2a45] bg-[#141f38] py-1.5 pl-2 pr-2.5">
            <span className="font-mono text-[12.5px] font-semibold text-[#8af1ff]">12 day streak</span>
          </div>
        </div>

        {/* Overview: Streak / Points / Stamps */}
        <div className="grid grid-cols-2 gap-px border-b border-[#1e2a45] bg-[#1e2a45]">
          <Tracking idx={0} title="Points" unit="pts" value={2480} />
          <Tracking idx={1} title="Streak" unit="d" value={12} />
        </div>

        {/* Today */}
        <div className="px-5 pt-4.5">
          <div className="mb-3 flex items-center justify-between font-display text-[13px] font-semibold">
            Today
          </div>

          <div className="flex items-center gap-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#1e2a45] bg-[#141f38]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M4 12h16M4 12l4-4M4 12l4 4" stroke="#2fe0ff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-[12.5px] font-semibold">Offer</span>
                <span className="font-mono text-[11.5px] text-[#69769a]">
                  <b className="font-semibold text-(--text-neon)">80</b> / 100 pts
                </span>
              </div>
              <div className="flex gap-1">
                {[1, 1, 1, 0, 0].map((done, i) => (
                <div
                  key={i}
                  className={
                    "h-2.5 flex-1 rounded-full border " +
                    (done
                      ? "border-transparent bg-linear-to-r from-(--accent) to-(--accent-secondary) shadow-[0_0_8px_-1px_rgba(47,224,255,0.5)]"
                      : "border-(--disabled-border) bg-(--disabled-bg)")
                  }
                />
              ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-(--border) py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#1e2a45] bg-[#141f38]">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <circle cx="11" cy="11" r="6" stroke="#2fe0ff" strokeWidth={2} />
                <path d="M20 20l-4.5-4.5" stroke="#2fe0ff" strokeWidth={2} strokeLinecap="round" />
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
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="#33e3a6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-1 items-center justify-between gap-2.5">
              <div>
                <div className="mb-0.5 text-[12.5px] font-semibold">Unclaimed</div>
                <div className="font-mono tracking-[-0.15px] text-[11.5px] text-[#758ac4]">
                  <b className="font-semibold text-(--text-neon)">60 pts</b> queued
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stamps */}
        <div className="px-5 pt-[18px]">
          <div className="mb-3 flex items-center justify-between font-display text-[13px] font-semibold">
            Stamps
            <span className="font-sans text-[11px] font-medium text-[#69769a]">6 of 8 collected</span>
          </div>
          <div className="flex gap-1.5 pb-1">
            {[1, 1, 1, 1, 1, 1, 0, 0].map((filled, i) =>
              filled ? (
                <div
                  key={i}
                  className="aspect-square flex-1 rounded-lg bg-linear-to-br from-(--accent) to-(--accent-secondary) p-1 shadow-[0_0_12px_-2px_rgba(47,224,255,0.55)]"
                >
                  {check}
                </div>
              ) : (
                <div key={i} className="relative aspect-square flex-1 rounded-lg border border-(--border) bg-[#141f38]">
                  <div className="absolute left-1/2 top-1/2 size-1.25 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--disabled-bg)" />
                </div>
              )
            )}
          </div>
        </div>

        {/* Quests */}
        <div className="px-5 pb-[18px] pt-[18px]">
          <div className="mb-3 flex items-center justify-between font-display text-[13px] font-semibold">
            Quests
            <span className="font-sans text-[11px] font-medium text-[#69769a]">3 active</span>
          </div>

          {/* Daily set */}
          <div className="mb-2.5 rounded-2xl border border-[#1e2a45] bg-[#141f38] p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-[#2fe0ff]/25 bg-[#2fe0ff]/10">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                    <rect x="4" y="4" width="16" height="16" rx="3" stroke="#8af1ff" strokeWidth={2} />
                    <path d="M8 12h8M8 16h5" stroke="#8af1ff" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[12.5px] font-semibold">
                  Daily set
                  <span className="mt-0.5 block text-[10.5px] font-medium text-[#69769a]">3 of 5 tasks done</span>
                </div>
              </div>
              <div className="rounded-full border border-[#2fe0ff]/20 bg-[#2fe0ff]/[0.08] px-2 py-[3px] font-mono text-[11px] text-[#8af1ff]">
                +50 pts
              </div>
            </div>
            <div className="flex gap-1">
              {[1, 1, 1, 0, 0].map((done, i) => (
                <div
                  key={i}
                  className={
                    "h-1.5 flex-1 rounded-full border " +
                    (done
                      ? "border-transparent bg-linear-to-r from-(--accent) to-(--accent-secondary) shadow-[0_0_8px_-1px_rgba(47,224,255,0.5)]"
                      : "border-(--disabled-border) bg-(--disabled-bg)")
                  }
                />
              ))}
            </div>
          </div>

          {/* Persistence */}
          <div className="mb-2.5 rounded-2xl border border-(--border) bg-[#141f38] p-3.5">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-(--border) bg-(--disabled-bg)">
                  <div className="h-3.5 w-3.5">{bolt("#8af1ff")}</div>
                </div>
                <div className="text-[12.5px] font-semibold">
                  Persistence
                  <span className="mt-0.5 block text-[10.5px] font-medium text-[#69769a]">5 of 7 days active</span>
                </div>
              </div>
              <div className="rounded-full border border-(--border) bg-(--disabled-bg) px-2 py-[3px] font-mono text-[11px] text-(--text-neon)">
                +120 pts
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((d) => (
                <div key={d} className="flex h-6 flex-1 items-center justify-center rounded-md bg-linear-to-b from-(--accent) to-(--accent-secondary) p-1">
                  {check}
                </div>
              ))}
              {[6, 7].map((d) => (
                <div key={d} className="flex h-6 flex-1 items-center justify-center rounded-md border border-(--border) bg-(--disabled-bg)">
                  <span className="text-[9px] font-semibold text-(--disabled-border)">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="rounded-2xl border border-(--border) bg-[#141f38] p-3.5">
            <div className="mb-1 flex items-center gap-2">
              <div className="flex h-[26px] w-[26px] items-center justify-center rounded-lg border border-(--border) bg-(--disabled-bg)">
                <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                  <path
                    d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"
                    stroke="#8af1ff"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="text-[12.5px] font-semibold">
                Activities
                <span className="mt-0.5 block text-[10.5px] font-medium text-[#69769a]">bonus tasks this week</span>
              </div>
            </div>

            {[
              { name: "Redeem an offer", count: "1 / 1", on: true },
              { name: "Share a stamp card", count: "0 / 1", on: false },
              { name: "Refer a friend", count: "0 / 3", on: false },
            ].map((a, i) => (
              <div key={a.name} className={"flex items-center gap-2.5 py-2 " + (i > 0 ? "border-t border-dashed border-[#1e2a45]" : "")}>
                <div className={"h-[7px] w-[7px] shrink-0 rounded-full " + (a.on ? "bg-[#33e3a6] shadow-[0_0_6px_0_#33e3a6]" : "bg-[#48526c]")} />
                <div className="flex-1 text-[12px] font-medium">{a.name}</div>
                <div className="font-mono text-[11px] text-[#69769a]">{a.count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;