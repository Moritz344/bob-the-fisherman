export interface LogMessage {
  color?: string,
  level?: string,
  msg: string,
  timestamp: string
}

export interface Profile {
  name: string,
  auth: string,
  username: string,
  version: string,
  host: string,
  port?: string | number | undefined,
}

export interface BotCommand {
  name: string,
  desc: string,
  onlyCli: boolean
}


