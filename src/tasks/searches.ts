import { has_tag, log, sleep, randomHex } from "@/expand"
import { GetSearches, Storage, StorageKeys } from "@/rewards/utility"
import { TaskResponse } from "@/task-response"

let cached: string[] = []

type ReportStatus = {
  Failed?: true;
  AnimateHeader: boolean;
  IsAuthenticated: boolean;
  DashboardUrl: string;
  IsMobileClient: boolean;
  RewardsIncrement: number;
  RewardsSessionData: {
    IsRewardUser: boolean;
    IsLinkedUser: boolean;
    IsTenantEnabled: boolean;
    IsAadUser: boolean;
    IsTrialUser: boolean;
    TrialUserClaimBalance: number;
    IsRebatesUser: boolean;
    IsRebatesDeniedUser: boolean;
    Balance: number;
    RewardsBalance: number;
    GiveBalance: number;
    ClaimableBalance_lsearchc: number;
    IsLiftSearchCapScenarioEnabled: boolean;
    ConsciousState: string;
    IsClaimableBalanceMergeEnabled: boolean;
    RebatesBalance: number;
    IsGiveModeOn: boolean;
    GiveModeCid: string;
    GiveModeCName: string;
    PreviousBalance: number;
    GoalTrackBalance: number;
    IsLevel2: boolean;
    NewLevel: string;
    IsOptOut: boolean;
    IsSuspended: boolean;
    ShowAnimation: boolean;
    EPuid: string;
    IsRedirectedFromOldDashboard: boolean;
    ImpressionLifeTimeCount: number;
    DailyImpressionHPCount: number;
    DailyImpressionSerpCount: number;
    VisitedCount: number;
    LastVisitTime: string;
    LastAutoOpenFlyoutTime: string;
    LastRewardsDashboardVisitTimeEpoch: number;
    LastRewardsFlyoutLoadTimeEpoch: number;
    LastRewardsL2AutoGoBigFlyoutLoadTime: number;
    AutoOpenFlyoutFlag: boolean;
    IsCLOUser: boolean;
    Waitlist: string;
    IsAdultMSA: string;
    IsMSA18: string;
    IsCcpEligible: string;
    HasUsedCcpTrial: string;
    SERPTheme: string;
    DailyCheckInProgress: number;
    DailyCheckInAnimate: number;
    DailySearchPointsEarned: number;
    DailySearchPointsLimit: number;
    LastAadRedDotShown: string;
    LastMedallionRedemptionAnimationImpression: string;
    IsRedemptionReadyAndAnimationEnabled: boolean;
    IsUserFirstMedallionImpressionToday: boolean;
    MedallionGiftHoverTooltipText: string;
    ShowMedallionFadeAnimation: boolean;
    DSESearchEarning: boolean;
    RebatesUserExperiences: string;
  };
  RewardsHeader: string;
  NeedUpdateRewardsHeaderLink: boolean;
  AnimationAltText: string;
  AutoOpenFlyout: boolean;
  AutoOpenGoBigL2Scenario: string;
  IsNewLevelMedallionEnabled: boolean;
  IsNewLevelMedallionEnabledForAllVertical: boolean;
  NewLevelTreatment: string;
  IsVNextHomepage: boolean;
  IsVNextFlyoutEnabled: boolean;
  IsLiftSearchCapScenarioEnabled: boolean;
  IsClaimableBalanceMergeEnabled: boolean;
  IsConsciousUser: boolean;
  IsAutoOpenGoBigL2Treatment: boolean;
  BnpReportActivityProperties: {
    IsBnpReportActivityEligible: boolean;
    NotificationsInsertionPointId: number;
    PartnerId: string;
  };
  AutoOpenFlyoutSuppressionReason: string;
  IsGiveHeaderTextEnabled: boolean;
  IsGiveSerpHeaderTealHeartEnabled: boolean;
  IsRewardsEntryPointEnabled: boolean;
  IsMuidCopilotSearchMobileMedallionEnabled: boolean;
  BalanceMessage: string | null;
  ShowNonMemberUpsellMessage: boolean;
  LogWaitlistAutoJoin: boolean;
  IsDailyCheckInMedallionAnimationEnabled: boolean;
  UseRedDotFromBingDomain: boolean;
  SendFingerprint: boolean;
  SendFingerprintV4: boolean;
};

const reportSearch = async (query: string) => {
    log.activities(`Reporting search "${query} to Microsoft's API for points"`)
    const IG = randomHex(32)
    const IID = `SERP.${Math.floor(Math.random() * 10000)}`
    const rdr = Math.floor(Math.random() * 10) + 1
    const rdrig = randomHex(32)

    const url = "https://www.bing.com/rewardsapp/reportActivity"
    const params = new URLSearchParams({ IG, IID, q: query, FORM: "HDRSC1", rdr: `${rdr}`, rdrig, ajaxreq: "1" })
    const body = new URLSearchParams({ url: `https://www.bing.com/search?q=${encodeURIComponent(query)}&FORM=HDRSC1&rdr=${rdr}&rdrig=${rdrig}`, V: "web" })

    return await fetch(`${url}?${params}`, {
        method: "POST", body, credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "*/*" }
    })
}

const ParseReport = (response: string): ReportStatus => {
    try { return JSON.parse(response.split("ReportActivity(")[1].split(")")[0]) }
    catch (e) {
        log.pc_search("Failed to parse report from server. Error:", e)
        return { Failed:true } as ReportStatus
    }
}

const GetCurrentState = async (query: string): Promise<ReportStatus> => {
    const [_, reportResponse] = await Promise.all([
        fetch(`https://bing.com/search?q=${query}`), reportSearch( query )
    ])

    const ParsedReport = ParseReport(await reportResponse.text())
    return ParsedReport
}

export default async (): Promise<TaskResponse> => {
    if (has_tag("ignore_pc_search")) {
        await Storage.set(StorageKeys.SearchCompletion, true)
        return TaskResponse.Confirm
    }

    const completed = await Storage.get(StorageKeys.SearchCompletion)
    if (completed == true) return TaskResponse.Confirm

    try {
        if (cached.length > 1) cached = GetSearches()
        const queries = cached.sort(() => 0.5 - Math.random())
        const CurrentState = await GetCurrentState(queries[Math.round(Math.random() * queries.length)])

        log.pc_search("Queries list length:", queries.length, "items")

        let searchesDone = CurrentState.RewardsSessionData.DailySearchPointsEarned
        const maxSearches = CurrentState.RewardsSessionData.DailySearchPointsLimit

        log.pc_search("Current search progress:", `${searchesDone}/${maxSearches}`)

        // self-explainatory
        for (const query of queries) {
            if (searchesDone >= maxSearches) break

            try {
                await Promise.all([ fetch(`https://bing.com/search?q=${query}`), reportSearch( query ) ]);
                searchesDone += 3;
            }
            catch(e) { log.pc_search("Failed to search:", e) }

            await sleep(7000 + Math.random() * 3500)
        }
    }
    catch (e) {
        log.pc_search("Unknown error:", e)
        return TaskResponse.UnknownError
    }

    log.pc_search("Done. Awaiting confirmation")
    return TaskResponse.Done
}