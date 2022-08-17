import {
  MessagePayload,
  ReplyMessageOptions,
  InteractionReplyOptions,
} from 'discord.js'

export type SIMPLE_COMMAND_OPTIONS =
  | string
  | MessagePayload
  | ReplyMessageOptions
export type COMMAND_INTERACTION_OPTIONS = InteractionReplyOptions & {
  fetchReply: true
}
