import { useSpring, motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import Icon from "../../public/icon.png"

const Coins = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/></svg>
const Fire = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>
const MagnifyingGlass = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
const PaperScroll = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
const Calendar = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
const Camera = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>
const X = ({ fill }: { fill: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={fill} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>

const Gear = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
const Bot = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
const Trophy = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2"/><path d="M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2"/><path d="M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3"/><path d="M4 22h16"/><path d="M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z"/><path d="M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3"/></svg>

const ButtonPillClass = "cursor-pointer flex items-center justify-center bg-white active:bg-[#f0f0f0] transition-colors duration-50 ease-in-out text-black p-1.5 px-3 rounded-full"
const PanelClass = "w-full flex border border-white/20 p-3 rounded-xl"
const PanelHoverClass = "cursor-pointer hover:bg-white/2 active:bg-white/5 transition-colors duration-100 ease-in-out"
const TrackerClass = `rounded-full overflow-hidden bg-[#1e1e1e] h-2 border border-white/10 w-full`
const TrackInnerClass = `rounded-full h-full transition-all duration-200 ease-out bg-white`
const NotchClass = `h-1.25 w-full rounded-full border transition-colors ease-out duration-300`
const OverlayBackground = `pointer-events-none flex flex-col items-center justify-center absolute top-0 left-0 bg-black/50 backdrop-blur-[2px] z-10 w-full h-full`
const OverlayModal = `pointer-events-auto bg-[#111] border-white/20 border rounded-xl min-w-50 min-h-20`

const Number = ({ from, to }: { from: number; to: number }) => {
  const spring = useSpring(from, { bounce: 0, duration: 1500 })
  const [value, setValue] = useState(from)

  useEffect(() => {
    spring.set(to)

    return spring.on("change", (latest) => {
      if (Math.round(to) > to)
        setValue(Math.round(latest * 10) / 10)
      else
        setValue(Math.round(latest))
    })
  }, [to, spring])

  return <>{value.toLocaleString()}</>
};

const Tracker = ({ progress }: { progress: number }) => {
  const spring = useSpring(0, { bounce: 0, duration: 1500 })
  const [value, setValue] = useState(spring.get())

  useEffect(() => {
    spring.set(progress)
  }, [progress, spring])

  useEffect(() => {
    return spring.on("change", (latest) => {
      setValue(Math.round(latest))
    })
  }, [spring])

  return <div className={TrackerClass}>
    <div className={TrackInnerClass} style={{ width: `${value}%` }} />
  </div>
}

const NotchesTracker = ({ progress, notch_count }: { progress: number, notch_count: number }) => {
  const [start, set_start] = useState(false)
  useEffect(() => (() => set_start(true))(), [])

  return <div className="flex gap-0.5">
    {Array.from({ length: notch_count }, (_, i) => (
      <div
        key={i}
        className={NotchClass}
        style={{
          background: (start && i < progress) ? "#fff" : "#ffffff00",
          borderColor: (start && i < progress) ? "#ffffff00" : "#ffffff55",
          transitionDelay: `${100 + i * 75}ms`
        }}
      />
    ))}
  </div>
}

const Button = ({
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={ButtonPillClass}
    >
      {children}
    </button>
  )
}

const Panel = ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
  <div onClick={onClick} className={[PanelClass, "p-3", onClick && PanelHoverClass].join(" ")}>
    {children}
  </div>
)

const Overlay = ({ children, onClose, title }: { title?:string, children?: React.ReactNode, onClose?: () => void }) => {
  return <AnimatePresence>
    { children && <motion.div transition={{ duration: 0.125, ease: [0,0,0.25,1] }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className={OverlayBackground}>
      <div className={OverlayModal}>
        <div className='p-3 mb-2 flex items-center justify-between'>
          <span className='tracking-[-0.02em] font-medium text-xl'> { !children ? "Loading..." : (title || "Panel")} </span>

          <button className='p-1 bg-white cursor-pointer rounded-full cursor-white' onClick={onClose}> <div className='size-4 fill-black'><X fill="black"/></div> </button>
        </div>
      
        {children}
      </div>
    </motion.div> }
  </AnimatePresence>
}

type PointsBreakdown = {
  today: number
  searches: number
  offers: number
  
  monthly: number
  yearly: number
  lifetime: number
  automated: number

  visual_search: number
}

const BreakdownItem = ({ title, val }: { title: string, val: number }) => (<div className='flex justify-between'>
  <span>{title}: </span> <span className='font-semibold'><Number from={0} to={val}/></span>
</div>)

const Breakdown = ({ info }: { info?: PointsBreakdown }) => {
  return <div className='p-3 pt-0 w-85'>
    <div className='flex gap-2'>
      <div className='w-[52%] h-full'>
        <Panel>
          <div className='w-full'>
            <span className='font-medium text-[18px]'>Today: <Number from={0} to={info?.today || 30} /></span>
            
            <div className='w-full bg-white/20 h-px my-2.5' />

            <div className='flex flex-col leading-[1.3em] tracking-[-0.01em]'>
              <BreakdownItem title='Searches' val={90} />
              <BreakdownItem title='Visual Search' val={5} />
              <BreakdownItem title='Offers' val={132} />
            </div>
          </div>
        </Panel>
      </div>

      <div className='w-[48%] flex justify-between flex-col'>
        <Panel>
          <div className='flex flex-col leading-tight'>
            <span className='font-medium text-md'>Monthly: <Number from={0} to={info?.monthly || 3032} /></span>
            <span className='tracking-[-0.005em] text-white/60 text-sm'>($0.32)</span>
          </div>
        </Panel>

        <Panel>
          <div className='flex flex-col leading-tight'>
            <span className='font-medium text-md'>Yearly: <Number from={0} to={info?.yearly || 30251} /></span>
            <span className='tracking-[-0.005em] text-white/60 text-sm'>($0.32)</span>
          </div>
        </Panel>
      </div>
    </div>

    <div
      className="mt-2 w-full rounded-2xl border border-white/10 p-4"
    >
      {/* Top stats */}
      <div className="flex items-center justify-between">

        {/* Automated */}
        <div className="flex items-center gap-3">
          <div
            className="p-2 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-400/20"
          >
            <Bot/>
          </div>

          <div>
            <p className="text-xs text-white/70">
              Automated
            </p>
            <p className="text-lg font-semibold">
              12,400
            </p>
          </div>
        </div>

        <div className='w-px h-12 bg-white/20' />


        {/* Lifetime */}
        <div className="flex items-center gap-3 text-right">

          <div>
            <p className="text-xs text-white/70">
              Lifetime
            </p>
            <p className="text-lg font-semibold">
              25,025
            </p>
          </div>

          <div className="p-2 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10 border border-yellow-400/20">
            <Trophy/>
          </div>

        </div>

      </div>


      {/* Progress */}
      <div className="mt-5">

        <div className="mb-2 flex justify-between text-xs">
          <span className="text-white/70">
            Assisted Rate
          </span>

          <span className="text-white/70">
            <Number from={0} to={49.5} />%
          </span>
        </div>


        <Tracker progress={49.5} />
      </div>

    </div>

  </div>
}

const DashboardPanel = ({ title, value, unit, Ico, onClick }: { onClick?: () => void, Ico: React.ReactNode, title: string, value: number, unit?: string, sub: string }) => (
  <Panel onClick={onClick}>
    <div className='flex items-center gap-2'>
      <div className='size-12 subtle_bg'>{Ico}</div>
      <div className='leading-4'>
        <p className="text-[22px] font-inter font-semibold tracking-[-0.015em] mb-1">{title}</p>
        <span className='tracking-[0.02em] text-white/80 text-md font-medium'><Number from={0} to={value} />{unit}</span>
        <p className='text-sm text-white/50'>keep it up!</p>
      </div>
    </div>
  </Panel>
)

const TrackingPanel = ({
  type, Icon, title, 
  text, progress, notches = 0
}: {
  type: "normal" | "notches",
  Icon: React.ReactNode,
  title: string, text: React.ReactNode,
  progress: number, notches?: number
}) => (<Panel>
  <div className='w-full flex items-center gap-3'>
    <div className='size-11 subtle_bg p-1.5'>{Icon}</div>
    <div className='w-full'>
      <div className='flex items-center justify-between'>
        <p className="text-[18px] font-medium tracking-[-0.015em] mb-1">{title}</p>
        <span className='text-white/50'>{text}</span>
      </div>
      {
        type == "normal" ? <Tracker progress={progress} /> : <NotchesTracker notch_count={notches} progress={progress} />
      }
    </div>
  </div>
</Panel>)

const Settings = () => <div>

</div>

const App = () => {
  const [overlay, set_overlay] = useState<React.ReactNode|null>()
  const [ovl_t, set_ovlt] = useState<string>("")

  return <div className="relative overflow-hidden select-none text-white bg-(--background) w-95 h-150 rounded-2xl border border-white/20">
    <Overlay title={ovl_t} onClose={() => { set_overlay(null); set_ovlt("Points Breakdown") }}>{overlay}</Overlay>

    <div className='p-4.5 flex items-center justify-between'>
      <div className='flex items-center gap-2.5'>
        <img src={Icon} className='size-8' />
        <p className="font-bold text-2xl">Feather</p>
      </div>

      <div className='flex gap-2'>
        <Button>
          0.0.0
        </Button>
        <button className='cursor-pointer flex items-center justify-center bg-white hover:bg-[#fafafa] active:bg-[#f0f0f0] transition-colors duration-50 ease-in-out text-black p-1.5 rounded-full'>
          <div className='size-6'><Gear/></div>
        </button>
      </div>
    </div>

    <div className='p-3 leading-4 tracking-[-0.015em] pb-0'>
      <p className='font-medium text-xl mb-2'>Account Statistic</p>
    </div>

    <div className='p-3 flex gap-3 w-full'>
      <DashboardPanel
        Ico={<Coins />}
        title='Points'
        value={35235}
        sub='+5 today'
        onClick={() => set_overlay(<Breakdown />)}
      />

      <DashboardPanel
        Ico={<Fire />}
        title='Streak'
        value={12} unit="d"
        sub='keep it up!'
      />
    </div>

    <div className='p-3 pt-0'>
      <span className='tracking-[-0.02em] font-medium text-xl'>Automation summary</span>

      <TrackingPanel
        Icon={<MagnifyingGlass/>} title='Searches'
        text={<> <Number from={0} to={30}/>/90 </>}
        type="normal" progress={50}
      />

      <TrackingPanel
        Icon={<Camera/>} title='Visual Search'
        text={<> <Number from={0} to={5}/> pts</>}
        type="normal" progress={100}
      />

      <TrackingPanel
        Icon={<PaperScroll/>} title='Activities'
        text={<> <Number from={0} to={12}/>/12</>}
        type="notches" progress={20} notches={6}
      />

      <TrackingPanel
        Icon={<Calendar />} title='Daily Set'
        text={<> <Number from={0} to={3}/>/3</>}
        type="notches" progress={20} notches={3}
      />
    </div>
  </div>
}

export default App