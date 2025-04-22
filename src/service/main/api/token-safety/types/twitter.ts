export type TwitterInfoReq = {
  /**
   * Lang, reply language, default is Chinese (zh)
   */
  lang?: string
  /**
   * Url, the Twitter URL to analyze
   */
  url: string
}

export type TwitterStatusRes = {
  /**
   * Classification, account classification
   */
  classification?: string
  /**
   * Cnkolfollowerscount, Chinese KOL followers count
   */
  cnKolFollowersCount?: number
  /**
   * Deletecount, number of deleted posts
   */
  deleteCount?: number
  /**
   * Influencelevel, influence level
   */
  influenceLevel?: string
  /**
   * Iskol, whether the account is a KOL
   */
  isKOL?: boolean
  /**
   * Kolrank, KOL ranking
   */
  kolRank?: number
  /**
   * Message, analysis result description
   */
  message?: string
  /**
   * Renamecount, number of name changes
   */
  renameCount?: number
  /**
   * Risklevel, risk level
   */
  riskLevel?: string
  /**
   * Smartfollowers, smart followers count
   */
  smartFollowers?: number
  /**
   * Topfollowers, top followers count
   */
  topFollowers?: number
  /**
   * Url, the analyzed Twitter URL
   */
  url?: string
  /**
   * Screen Name, Twitter username
   */
  screenName?: string
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
  twitter_status?: TwitterStatusRes
  twitter_rename_record?: TwitterRenameRes
}
