export type Player = {
  id: string
  clientId: string
  connected: boolean
  username: string
  points: number
}

export type Answer = {
  playerId: string
  answerId: number
  points: number
}

export type Quizz = {
  subject: string
  background?: string
  autoNextDelay?: number
  questions: {
    question: string
    image?: string
    video?: string
    audio?: string
    background?: string
    answers: string[]
    solution: number
    cooldown: number
    time: number
  }[]
}

export type QuizzWithId = Quizz & { id: string }

export type GameUpdateQuestion = {
  current: number
  total: number
}
