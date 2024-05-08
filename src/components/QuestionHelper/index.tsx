import { HelpCircle as Question } from 'react-feather'
import Tooltip from '../Tooltip'

export default function QuestionHelper({ text }: { text: string }) {
  return (
    <Tooltip title={text}>
      <Question className={'ml-1'} tabIndex={0} size={16} />
    </Tooltip>
  )
}
