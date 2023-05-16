import { MutableRefObject, useRef } from 'react'
import { FlowDTO } from '../../scripts/cf/logic/FlowManager'

export type AnswerType = string | string[]
export type AnswerContext = 'ignore' | 'person' | 'question' | 'brand_interests'

export type StringAnswer = {
  answer: AnswerType
  audio?: never
}

export type AudioAnswer = {
  answer?: AnswerType
  audio?: Blob
}

export type Answer = {
  question: string
  cfAnswer?: [Answer['question'], Answer['answer']]
  name?: string
  context?: AnswerContext
} & (StringAnswer | AudioAnswer)

export const answersAsChatbotFormat = (options: {
  context?: AnswerContext
  answers: Answer[]
}): Record<string, string[] | string> => {
  const { context, answers } = options

  // Filter answers by context, if it was passed
  const answersCopy = context
    ? answers.filter((answer) => answer.context === context)
    : answers

  // [{answer: 'a', question: 'b'}, {answer: 'c', question: 'd'}]
  // > {b: 'a', d: 'c'}
  return answersCopy.reduce((acc, answer) => {
    const { question, answer: answerValue } = answer
    return {
      ...acc,
      [question]: answerValue
    }
  }, {})
}

export type UseChatbotAutoSaveOptions = {
  key?: string
  /** @default chatbot_answers_ */
  answersKey?: string
  /** @default 'confidencial_confirm' */
  confidentialConfirmTagName?: string
  /** @default true */
  active?: boolean
}

export const useChatbotAutoSave = (
  options?: UseChatbotAutoSaveOptions
): {
  answers: Answer[]
  addAnswer: (dto: FlowDTO) => void
  clearAnswers: () => void
  answersRef: MutableRefObject<Answer[]>
} => {
  const { active, answersKey, confidentialConfirmTagName, key } = options || {
    active: true,
    answersKey: 'chatbot_answers_',
    confidentialConfirmTagName: 'confidencial_confirm'
  }
  const localKey = key || answersKey + window.location.href

  const answersRef = useRef<Answer[]>(
    active ? JSON.parse(localStorage.getItem(localKey) || '[]') : []
  )

  const addAnswer = (dto: FlowDTO) => {
    if (!dto?.tag?.name) return

    const question = dto.tag?.id || (dto.tag?.name as string)
    const answer = (dto.tag?.value || dto.text) as string

    const newAnswer: Answer = {
      answer,
      question,
      name: (dto.tag?.domElement as HTMLInputElement)?.name,
      cfAnswer: [question, answer],
      context:
        (dto?.tag?.domElement?.attributes as any)?.context?.nodeValue ||
        'question'
    }

    const newAnswers = [...answersRef.current, newAnswer]

    if (active && dto.tag.id !== confidentialConfirmTagName) {
      // Persistent Auto-save
      localStorage.setItem(localKey, JSON.stringify(newAnswers))
    }

    answersRef.current = newAnswers
  }

  const clearAnswers = () => {
    answersRef.current = []
    localStorage.removeItem(localKey)
  }

  return {
    answers: answersRef.current,
    answersRef,
    addAnswer,
    clearAnswers
  }
}
