import Icon from "../../rewards/public/icon.png"
import { motion, useSpring, useTransform } from "framer-motion";

export const Header = () => <div className="flex items-center justify-between border-b border-[#1e2a45] p-3">
    <div className="flex items-center gap-2.5">
        <img src={chrome.runtime ? "/icon.png" : Icon } alt="Icon" className="size-8" />
        <div className="font-display text-2xl font-bold tracking-tight">{chrome.runtime?.getManifest().name || "Feather"}</div>
    </div>
    <div className="flex items-center gap-1.5 rounded-full border border-[#1e2a45] bg-[#141f38] py-1.5 pl-2 pr-2.5">
        <span className="font-mono text-[12.5px] font-semibold text-[#8af1ff]">{chrome.runtime?.getManifest().version || "0.0.0"}</span>
    </div>
</div>