export interface currentSelectedType{
  host: string,
  port: number,
  username: string,
  version: string,
  auth: string,
  started?: boolean
}

export interface currentSelectedActionType{
  playerToFollow: string,
  waterMaxDistance: number
}
