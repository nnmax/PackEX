export interface CommonResponse<Data = unknown> {
  code: number
  message: string
  prompt: string
  timestamp: number
  data: Data
}
