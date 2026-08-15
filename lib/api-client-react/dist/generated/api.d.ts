import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { Achievement, AchievementInput, AdminConfigInput, AdminGameConfig, AdminStats, Announcement, AnnouncementInput, AnnouncementUpdate, DailyRewardClaim, DailyRewardStatus, ErrorResponse, GameConfig, GetLeaderboardParams, HealthStatus, LeaderboardEntry, NftVerification, Player, PlayerInput, PlayerStats, SpinInput, SpinResult, SuccessResponse } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPlayerUrl: (address: string) => string;
/**
 * @summary Get player profile
 */
export declare const getPlayer: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<Player>;
export declare const getGetPlayerQueryKey: (address: string) => readonly [`/api/players/${string}`];
export declare const getGetPlayerQueryOptions: <TData = Awaited<ReturnType<typeof getPlayer>>, TError = ErrorType<ErrorResponse>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPlayer>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPlayerQueryResult = NonNullable<Awaited<ReturnType<typeof getPlayer>>>;
export type GetPlayerQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get player profile
 */
export declare function useGetPlayer<TData = Awaited<ReturnType<typeof getPlayer>>, TError = ErrorType<ErrorResponse>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayer>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpsertPlayerUrl: (address: string) => string;
/**
 * @summary Create or update player profile
 */
export declare const upsertPlayer: (address: string, playerInput: PlayerInput, options?: Parameters<typeof customFetch>[1]) => Promise<Player>;
export declare const getUpsertPlayerMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof upsertPlayer>>, TError, {
        address: string;
        data: BodyType<PlayerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof upsertPlayer>>, TError, {
    address: string;
    data: BodyType<PlayerInput>;
}, TContext>;
export type UpsertPlayerMutationResult = NonNullable<Awaited<ReturnType<typeof upsertPlayer>>>;
export type UpsertPlayerMutationBody = BodyType<PlayerInput>;
export type UpsertPlayerMutationError = ErrorType<unknown>;
/**
* @summary Create or update player profile
*/
export declare const useUpsertPlayer: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof upsertPlayer>>, TError, {
        address: string;
        data: BodyType<PlayerInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof upsertPlayer>>, TError, {
    address: string;
    data: BodyType<PlayerInput>;
}, TContext>;
export declare const getGetPlayerStatsUrl: (address: string) => string;
/**
 * @summary Get detailed player statistics
 */
export declare const getPlayerStats: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<PlayerStats>;
export declare const getGetPlayerStatsQueryKey: (address: string) => readonly [`/api/players/${string}/stats`];
export declare const getGetPlayerStatsQueryOptions: <TData = Awaited<ReturnType<typeof getPlayerStats>>, TError = ErrorType<ErrorResponse>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayerStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPlayerStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPlayerStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getPlayerStats>>>;
export type GetPlayerStatsQueryError = ErrorType<ErrorResponse>;
/**
 * @summary Get detailed player statistics
 */
export declare function useGetPlayerStats<TData = Awaited<ReturnType<typeof getPlayerStats>>, TError = ErrorType<ErrorResponse>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPlayerStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getRecordSpinUrl: () => string;
/**
 * @summary Record a spin result and update player stats
 */
export declare const recordSpin: (spinInput: SpinInput, options?: Parameters<typeof customFetch>[1]) => Promise<SpinResult>;
export declare const getRecordSpinMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSpin>>, TError, {
        data: BodyType<SpinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof recordSpin>>, TError, {
    data: BodyType<SpinInput>;
}, TContext>;
export type RecordSpinMutationResult = NonNullable<Awaited<ReturnType<typeof recordSpin>>>;
export type RecordSpinMutationBody = BodyType<SpinInput>;
export type RecordSpinMutationError = ErrorType<ErrorResponse>;
/**
* @summary Record a spin result and update player stats
*/
export declare const useRecordSpin: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof recordSpin>>, TError, {
        data: BodyType<SpinInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof recordSpin>>, TError, {
    data: BodyType<SpinInput>;
}, TContext>;
export declare const getGetDailyRewardStatusUrl: (address: string) => string;
/**
 * @summary Check if player has claimed today's daily reward
 */
export declare const getDailyRewardStatus: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<DailyRewardStatus>;
export declare const getGetDailyRewardStatusQueryKey: (address: string) => readonly [`/api/game/daily-reward/${string}`];
export declare const getGetDailyRewardStatusQueryOptions: <TData = Awaited<ReturnType<typeof getDailyRewardStatus>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDailyRewardStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDailyRewardStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDailyRewardStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getDailyRewardStatus>>>;
export type GetDailyRewardStatusQueryError = ErrorType<unknown>;
/**
 * @summary Check if player has claimed today's daily reward
 */
export declare function useGetDailyRewardStatus<TData = Awaited<ReturnType<typeof getDailyRewardStatus>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDailyRewardStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getClaimDailyRewardUrl: (address: string) => string;
/**
 * @summary Claim daily reward
 */
export declare const claimDailyReward: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<DailyRewardClaim>;
export declare const getClaimDailyRewardMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimDailyReward>>, TError, {
        address: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof claimDailyReward>>, TError, {
    address: string;
}, TContext>;
export type ClaimDailyRewardMutationResult = NonNullable<Awaited<ReturnType<typeof claimDailyReward>>>;
export type ClaimDailyRewardMutationError = ErrorType<ErrorResponse>;
/**
* @summary Claim daily reward
*/
export declare const useClaimDailyReward: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof claimDailyReward>>, TError, {
        address: string;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof claimDailyReward>>, TError, {
    address: string;
}, TContext>;
export declare const getGetGameConfigUrl: () => string;
/**
 * @summary Get public game configuration (jackpot, spin cost, etc.)
 */
export declare const getGameConfig: (options?: Parameters<typeof customFetch>[1]) => Promise<GameConfig>;
export declare const getGetGameConfigQueryKey: () => readonly ["/api/game/config"];
export declare const getGetGameConfigQueryOptions: <TData = Awaited<ReturnType<typeof getGameConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGameConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getGameConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetGameConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getGameConfig>>>;
export type GetGameConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get public game configuration (jackpot, spin cost, etc.)
 */
export declare function useGetGameConfig<TData = Awaited<ReturnType<typeof getGameConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getGameConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetLeaderboardUrl: (params?: GetLeaderboardParams) => string;
/**
 * @summary Get top players leaderboard
 */
export declare const getLeaderboard: (params?: GetLeaderboardParams, options?: Parameters<typeof customFetch>[1]) => Promise<LeaderboardEntry[]>;
export declare const getGetLeaderboardQueryKey: (params?: GetLeaderboardParams) => readonly ["/api/leaderboard", ...GetLeaderboardParams[]];
export declare const getGetLeaderboardQueryOptions: <TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(params?: GetLeaderboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetLeaderboardQueryResult = NonNullable<Awaited<ReturnType<typeof getLeaderboard>>>;
export type GetLeaderboardQueryError = ErrorType<unknown>;
/**
 * @summary Get top players leaderboard
 */
export declare function useGetLeaderboard<TData = Awaited<ReturnType<typeof getLeaderboard>>, TError = ErrorType<unknown>>(params?: GetLeaderboardParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getLeaderboard>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAchievementsUrl: (address: string) => string;
/**
 * @summary Get player achievements
 */
export declare const getAchievements: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<Achievement[]>;
export declare const getGetAchievementsQueryKey: (address: string) => readonly [`/api/achievements/${string}`];
export declare const getGetAchievementsQueryOptions: <TData = Awaited<ReturnType<typeof getAchievements>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAchievements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAchievements>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAchievementsQueryResult = NonNullable<Awaited<ReturnType<typeof getAchievements>>>;
export type GetAchievementsQueryError = ErrorType<unknown>;
/**
 * @summary Get player achievements
 */
export declare function useGetAchievements<TData = Awaited<ReturnType<typeof getAchievements>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAchievements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUnlockAchievementUrl: (address: string) => string;
/**
 * @summary Unlock an achievement for a player
 */
export declare const unlockAchievement: (address: string, achievementInput: AchievementInput, options?: Parameters<typeof customFetch>[1]) => Promise<Achievement>;
export declare const getUnlockAchievementMutationOptions: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlockAchievement>>, TError, {
        address: string;
        data: BodyType<AchievementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof unlockAchievement>>, TError, {
    address: string;
    data: BodyType<AchievementInput>;
}, TContext>;
export type UnlockAchievementMutationResult = NonNullable<Awaited<ReturnType<typeof unlockAchievement>>>;
export type UnlockAchievementMutationBody = BodyType<AchievementInput>;
export type UnlockAchievementMutationError = ErrorType<ErrorResponse>;
/**
* @summary Unlock an achievement for a player
*/
export declare const useUnlockAchievement: <TError = ErrorType<ErrorResponse>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof unlockAchievement>>, TError, {
        address: string;
        data: BodyType<AchievementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof unlockAchievement>>, TError, {
    address: string;
    data: BodyType<AchievementInput>;
}, TContext>;
export declare const getGetAnnouncementsUrl: () => string;
/**
 * @summary Get active announcements
 */
export declare const getAnnouncements: (options?: Parameters<typeof customFetch>[1]) => Promise<Announcement[]>;
export declare const getGetAnnouncementsQueryKey: () => readonly ["/api/announcements"];
export declare const getGetAnnouncementsQueryOptions: <TData = Awaited<ReturnType<typeof getAnnouncements>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAnnouncementsQueryResult = NonNullable<Awaited<ReturnType<typeof getAnnouncements>>>;
export type GetAnnouncementsQueryError = ErrorType<unknown>;
/**
 * @summary Get active announcements
 */
export declare function useGetAnnouncements<TData = Awaited<ReturnType<typeof getAnnouncements>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAnnouncements>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getVerifyNftUrl: (address: string) => string;
/**
 * @summary Server-side NFT ownership verification
 */
export declare const verifyNft: (address: string, options?: Parameters<typeof customFetch>[1]) => Promise<NftVerification>;
export declare const getVerifyNftQueryKey: (address: string) => readonly [`/api/nft/verify/${string}`];
export declare const getVerifyNftQueryOptions: <TData = Awaited<ReturnType<typeof verifyNft>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyNft>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof verifyNft>>, TError, TData> & {
    queryKey: QueryKey;
};
export type VerifyNftQueryResult = NonNullable<Awaited<ReturnType<typeof verifyNft>>>;
export type VerifyNftQueryError = ErrorType<unknown>;
/**
 * @summary Server-side NFT ownership verification
 */
export declare function useVerifyNft<TData = Awaited<ReturnType<typeof verifyNft>>, TError = ErrorType<unknown>>(address: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof verifyNft>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminConfigUrl: () => string;
/**
 * @summary Get full admin game configuration
 */
export declare const getAdminConfig: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminGameConfig>;
export declare const getGetAdminConfigQueryKey: () => readonly ["/api/admin/config"];
export declare const getGetAdminConfigQueryOptions: <TData = Awaited<ReturnType<typeof getAdminConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminConfig>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminConfigQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminConfig>>>;
export type GetAdminConfigQueryError = ErrorType<unknown>;
/**
 * @summary Get full admin game configuration
 */
export declare function useGetAdminConfig<TData = Awaited<ReturnType<typeof getAdminConfig>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminConfig>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAdminConfigUrl: () => string;
/**
 * @summary Update game configuration
 */
export declare const updateAdminConfig: (adminConfigInput: AdminConfigInput, options?: Parameters<typeof customFetch>[1]) => Promise<AdminGameConfig>;
export declare const getUpdateAdminConfigMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminConfig>>, TError, {
        data: BodyType<AdminConfigInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdminConfig>>, TError, {
    data: BodyType<AdminConfigInput>;
}, TContext>;
export type UpdateAdminConfigMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdminConfig>>>;
export type UpdateAdminConfigMutationBody = BodyType<AdminConfigInput>;
export type UpdateAdminConfigMutationError = ErrorType<unknown>;
/**
* @summary Update game configuration
*/
export declare const useUpdateAdminConfig: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminConfig>>, TError, {
        data: BodyType<AdminConfigInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdminConfig>>, TError, {
    data: BodyType<AdminConfigInput>;
}, TContext>;
export declare const getGetAdminStatsUrl: () => string;
/**
 * @summary Get global game statistics for admin
 */
export declare const getAdminStats: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminStats>;
export declare const getGetAdminStatsQueryKey: () => readonly ["/api/admin/stats"];
export declare const getGetAdminStatsQueryOptions: <TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminStats>>>;
export type GetAdminStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get global game statistics for admin
 */
export declare function useGetAdminStats<TData = Awaited<ReturnType<typeof getAdminStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getResetLeaderboardUrl: () => string;
/**
 * @summary Reset the leaderboard
 */
export declare const resetLeaderboard: (options?: Parameters<typeof customFetch>[1]) => Promise<SuccessResponse>;
export declare const getResetLeaderboardMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetLeaderboard>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof resetLeaderboard>>, TError, void, TContext>;
export type ResetLeaderboardMutationResult = NonNullable<Awaited<ReturnType<typeof resetLeaderboard>>>;
export type ResetLeaderboardMutationError = ErrorType<unknown>;
/**
* @summary Reset the leaderboard
*/
export declare const useResetLeaderboard: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof resetLeaderboard>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof resetLeaderboard>>, TError, void, TContext>;
export declare const getCreateAnnouncementUrl: () => string;
/**
 * @summary Create a new announcement
 */
export declare const createAnnouncement: (announcementInput: AnnouncementInput, options?: Parameters<typeof customFetch>[1]) => Promise<Announcement>;
export declare const getCreateAnnouncementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
        data: BodyType<AnnouncementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
    data: BodyType<AnnouncementInput>;
}, TContext>;
export type CreateAnnouncementMutationResult = NonNullable<Awaited<ReturnType<typeof createAnnouncement>>>;
export type CreateAnnouncementMutationBody = BodyType<AnnouncementInput>;
export type CreateAnnouncementMutationError = ErrorType<unknown>;
/**
* @summary Create a new announcement
*/
export declare const useCreateAnnouncement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
        data: BodyType<AnnouncementInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAnnouncement>>, TError, {
    data: BodyType<AnnouncementInput>;
}, TContext>;
export declare const getUpdateAnnouncementUrl: (id: number) => string;
/**
 * @summary Update announcement (activate/deactivate)
 */
export declare const updateAnnouncement: (id: number, announcementUpdate: AnnouncementUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<Announcement>;
export declare const getUpdateAnnouncementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAnnouncement>>, TError, {
        id: number;
        data: BodyType<AnnouncementUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAnnouncement>>, TError, {
    id: number;
    data: BodyType<AnnouncementUpdate>;
}, TContext>;
export type UpdateAnnouncementMutationResult = NonNullable<Awaited<ReturnType<typeof updateAnnouncement>>>;
export type UpdateAnnouncementMutationBody = BodyType<AnnouncementUpdate>;
export type UpdateAnnouncementMutationError = ErrorType<unknown>;
/**
* @summary Update announcement (activate/deactivate)
*/
export declare const useUpdateAnnouncement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAnnouncement>>, TError, {
        id: number;
        data: BodyType<AnnouncementUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAnnouncement>>, TError, {
    id: number;
    data: BodyType<AnnouncementUpdate>;
}, TContext>;
export declare const getDeleteAnnouncementUrl: (id: number) => string;
/**
 * @summary Delete an announcement
 */
export declare const deleteAnnouncement: (id: number, options?: Parameters<typeof customFetch>[1]) => Promise<void>;
export declare const getDeleteAnnouncementMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnnouncement>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteAnnouncement>>, TError, {
    id: number;
}, TContext>;
export type DeleteAnnouncementMutationResult = NonNullable<Awaited<ReturnType<typeof deleteAnnouncement>>>;
export type DeleteAnnouncementMutationError = ErrorType<unknown>;
/**
* @summary Delete an announcement
*/
export declare const useDeleteAnnouncement: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteAnnouncement>>, TError, {
        id: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteAnnouncement>>, TError, {
    id: number;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map