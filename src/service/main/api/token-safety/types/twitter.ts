export type TwitterInfoReq = {
  /**
   * Lang, reply language, default is Chinese (zh)
   */
  // lang?: string
  /**
   * username, the Twitter username to analyze
   */
  username: string
}

export type TwitterInfo = {
  /**
   * Description, User description
   */
  description?: null | string
  /**
   * Followers count, number of followers
   */
  followersCount?: number
  /**
   * Name, display name
   */
  name?: string
  /**
   * Score, user score
   */
  score?: number
  /**
   * Smart followers count, smart followers count
   */
  smartFollowersCount?: number
  /**
   * Smart level, user smart information
   */
  smartLevel?: number
  /**
   * Smart mentions count, smart mentions count
   */
  smartMentionsCount?: number
  /**
   * Twitter URL, Twitter link
   */
  twitterUrl?: string
  /**
   * Type, account type
   */
  type?: string
  /**
   * Mentions, mentions count
   */
  mentions?: number
  /**
   * Is verified, whether the account is verified
   */
  InfluenceLevel?: string
}

export type TwitterRenameRes = {
  /**
   * Id, Twitter user ID
   */
  id?: string
  /**
   * Screen Names, history name list
   */
  screen_names?: RenameHistory[]
  /**
   * Name, current name
   */
  name?: string
}

/**
 * RenameHistory, Twitter rename history
 */
export interface RenameHistory {
  /**
   * End Date, end using date
   */
  end_date?: string
  /**
   * Name, history name
   */
  name?: string
  /**
   * Start Date, start using date
   */
  start_date?: string
}

export type TwitterAccountInfo = {
  twitter_status?: TwitterInfo
  twitter_rename_record?: TwitterRenameRes
}
