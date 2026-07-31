declare type NextFlightData = `${string}:${string}`
declare type QuestDateFormat = `${string}/${string}/${string}`

declare type QuestData = {
  hash: string
  title: string
  points: number
  offerId: string
  isCompleted: boolean
  isLocked: boolean
  date?: QuestDateFormat
  isPromotional: boolean | None
}

declare type ReportStatus = {
  Failed?: true;
  AnimateHeader: boolean;
  IsAuthenticated: boolean;
  DashboardUrl: string;
  IsMobileClient: boolean;
  RewardsIncrement: number;
  RewardsSessionData: {
    DailySearchPointsEarned: number;
    DailySearchPointsLimit: number;
    Balance: number;
    RewardsBalance: number;
    [key: string]: any;
  };
  [key: string]: any;
};