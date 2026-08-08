import { useSpring, motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
import icon from '../../rewards/public/icon.png'
import { useEffect, useState } from 'react'

const Coins = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48"/><path d="M15 6h1v4"/><path d="m6.134 14.768.866-.5 2 3.464"/><circle cx="16" cy="8" r="6"/></svg>
const Fire = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>
const MagnifyingGlass = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 21-4.34-4.34"/><circle cx="11" cy="11" r="8"/></svg>
const PaperScroll = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/></svg>
const Calendar = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v3"/><path d="M16 2v3"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/></svg>
const Camera = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>
const X = ({ fill }: { fill: string }) => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={fill} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>

const ButtonClass = "cursor-pointer flex items-center justify-center bg-white active:bg-[#f0f0f0] transition-colors duration-50 ease-in-out text-black p-1.5 px-3 rounded-full"
const PanelClass = "w-full flex border border-white/20 p-3 rounded-xl"
const PanelHoverClass = "hover:bg-white/2 active:bg-white/5 transition-colors duration-100 ease-in-out"

const Number = ({ from, to }: { from: number; to: number }) => {
  const spring = useSpring(from, { bounce: 0, duration: 1500 });
  const [value, setValue] = useState(from);

  useEffect(() => {
    spring.set(to);
  }, [to, spring]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      setValue(Math.round(latest));
    });
  }, [spring]);

  return <>{value.toLocaleString()}</>;
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

  return <div className='rounded-full overflow-hidden bg-[#1e1e1e] h-2 border border-white/10 w-full'>
    <div className='h-full transition-all duration-200 ease-out bg-white' style={{ width: `${value}%` }} />
  </div>
}

const NotchesTracker = ({ progress, notch_count }: { progress: number, notch_count: number }) => {
  const [start, set_start] = useState(false)

  useEffect(() => set_start(true), [])

  return <div className="flex gap-[2px]">
    {Array.from({ length: notch_count }, (_, i) => (
      <div
        key={i}
        className="h-1.25 w-full rounded-full border transition-colors ease-out duration-300"
        style={{
          background: (start && i < progress) ? "#fff" : "#ffffff00",
          borderColor: (start && i < progress) ? "#ffffff00" : "#ffffff55",
          transitionDelay: `${i * 50}ms`
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
      className={ButtonClass}
    >
      {children}
    </button>
  )
}

const Panel = ({ children, onClick }: { children: any, onClick?: () => void }) => (
  <div onClick={onClick} className={[PanelClass, "p-3", onClick && PanelHoverClass].join(" ")}>
    {children}
  </div>
)

const Overlay = ({ children, onClose }: { children?: any, onClose?: () => void }) => {
  return <AnimatePresence>
    { children && <motion.div transition={{ duration: 0.125, ease: [0,0,0.25,1] }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} animate={{ opacity: 1 }} className='pointer-events-none flex flex-col items-center justify-center absolute top-0 left-0 bg-black/50 backdrop-blur-[2px] z-10 w-full h-full'>
      <div className='pointer-events-auto bg-[#111] border-white/20 border rounded-xl min-w-50 min-h-20'>
        <div className='p-3 mb-2 flex items-center justify-between'>
          <span className='tracking-[-0.02em] font-medium text-xl'> { !children ? "Loading..." : "Panel"} </span>

          <button className='p-1 bg-white rounded-full cursor-white' onClick={onClose}> <div className='size-4 fill-black'><X fill="black"/></div> </button>
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

const Breakdown = ({ info }: { info?: PointsBreakdown }) => {
  return <div className='p-3 pt-0 w-85'>
    <span>Points breakdown</span>
    <div className='flex gap-2'>
      <div className='w-[52%] h-full'>
        <Panel>
          <div className='w-full'>
            <span className='font-medium text-[18px]'>Today: <Number from={0} to={info?.today || 30} /></span>
            
            <div className='w-full bg-white/20 h-0.25 my-2.5' />

            <div className='flex flex-col leading-[1.3em] tracking-[-0.01em]'>
              <div className='flex justify-between'>
                <span>Searches: </span> <span className='font-semibold'><Number from={0} to={info?.searches || 90}/></span>
              </div>
              <div className='flex justify-between'>
                <span>Visual Search: </span> <span className='font-semibold'><Number from={0} to={info?.visual_search || 5}/></span>
              </div>
              <div className='flex justify-between'>
                <span>Offers: </span> <span className='font-semibold'><Number from={0} to={info?.offers || 10}/></span>
              </div>
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

    <div className={[PanelClass, PanelHoverClass, "mt-2"].join(" ")}>
      <div className='flex flex-col w-full'>
        <div className='pb-4 pt-2 flex justify-center'>
          <span className='font-medium text-md'>Lifetime: <Number from={0} to={info?.lifetime || 312520} /></span>
        </div>
        <div className='h-0.25 bg-white/20' />
        <div className='py-4 flex justify-center'>
          <span className='font-medium text-md'>Automated: <Number from={0} to={info?.automated || 312520} /></span>
        </div>
      </div>
    </div>

  </div>
}

const App = () => {
  const [overlay, set_overlay] = useState<any|null>()

  return <div className="relative overflow-hidden select-none text-white bg-(--background) w-95 overflow-hidden h-150 rounded-2xl border border-white/20">
    <Overlay onClose={() => set_overlay(null)}>{overlay}</Overlay>

    <div className='p-4.5 flex items-center justify-between'>
      <div className='flex items-center gap-3.5'>
        <img src={icon} alt="icon" className='size-10'/>
        <p className="font-bold text-2xl">Feather</p>
      </div>

      <Button>
        0.0.0
      </Button>
    </div>

    <div className='p-3 leading-[16px] tracking-[-0.015em] pb-0'>
      <p className='font-medium text-xl mb-2'>Account Statistic</p>
    </div>

    <div className='p-3 flex gap-3 w-full'>
      <Panel onClick={() => set_overlay(<Breakdown/>)}>

        <div className='flex items-center gap-2'>
          <div className='size-12 subtle_bg'><Coins /></div>
          <div className='leading-[16px]'>
            <p className="text-[22px] font-inter font-semibold tracking-[-0.015em] mb-[4px]">Points</p>
            <span className='tracking-[0.02em] text-white/80 text-md font-medium'><Number from={0} to={10226} /></span>
            <p className='text-sm text-white/50'>+5 today</p>
          </div>
        </div>

      </Panel>

      <Panel>
        <div className='flex items-center gap-2'>
          <div className='size-12 subtle_bg'><Fire /></div>
          <div className='leading-[16px]'>
            <p className="text-[22px] font-inter font-semibold tracking-[-0.015em] mb-[4px]">Streak</p>
            <span className='tracking-[0.02em] text-white/80 text-md font-medium'><Number from={0} to={12} />d</span>
            <p className='text-sm text-white/50'>keep it up!</p>
          </div>
        </div>
      </Panel>
    </div>

    <div className='p-3 pt-0'>
      <span className='tracking-[-0.02em] font-medium text-xl'>Automation summary</span>
      <Panel>
        <div className='w-full flex items-center gap-3'>
          <div className='size-11 subtle_bg p-1.5'><MagnifyingGlass/></div>
          <div className='w-full'>
            <div className='flex items-center justify-between'>
              <p className="text-[18px] font-medium tracking-[-0.015em] mb-[4px]">Searches</p>
              <span className='text-white/50'><Number from={0} to={30}/>/90</span>
            </div>
            <Tracker progress={50} />
          </div>
        </div>
      </Panel>

      <Panel>
        <div className='w-full flex items-center gap-3'>
          <div className='size-11 subtle_bg p-1.5'><Camera/></div>
          <div className='w-full'>
            <div className='flex items-center justify-between'>
              <p className="text-[18px] font-medium tracking-[-0.015em] mb-[4px]">Visual search</p>
              <span className='text-white/50'>5 pts</span>
            </div>
            <Tracker progress={100} />
          </div>
        </div>
      </Panel>

      <Panel>
        <div className='w-full flex items-center gap-3'>
          <div className='size-11 subtle_bg p-1.5'><PaperScroll/></div>
          <div className='w-full'>
            <div className='flex items-center justify-between'>
              <p className="text-[18px] font-medium tracking-[-0.015em] mb-[4px]">Activities</p>
              <span className='text-white/50'><Number from={0} to={12}/>/12</span>
            </div>
            <NotchesTracker progress={20} notch_count={6} />
          </div>
        </div>
      </Panel>

      <Panel>
        <div className='w-full flex items-center gap-3'>
          <div className='size-11 subtle_bg p-1.5'><Calendar/></div>
          <div className='w-full'>
            <div className='flex items-center justify-between'>
              <p className="text-[18px] font-medium tracking-[-0.015em] mb-[4px]">Daily Set</p>
              <span className='text-white/50'><Number from={0} to={3}/>/3</span>
            </div>
            <NotchesTracker progress={3} notch_count={3} />
          </div>
        </div>
      </Panel>
    </div>
  </div>
}

export default App