import {
  useConversationalForm,
  FormlessTag
} from '@jornadayu/conversational-form'
import '@jornadayu/conversational-form/dist/style.css'

const Chatbot: React.FC = () => {
  const tags = [
    {
      tag: 'cf-robot-message',
      name: 'name',
      id: '0',
      'cf-questions': 'Hello, this is a example of conversational form.'
    },
    {
      name: 'name',
      id: '1',
      'cf-questions': 'Whats your name?',
      tag: 'input'
    },
    {
      id: '2',
      multiple: true,
      name: 'my-multi-select',
      'cf-questions': 'What are your favorite colors?',
      children: [
        { tag: 'option', value: 'red', 'cf-label': 'Red' },
        { tag: 'option', value: 'green', 'cf-label': 'Green' },
        { tag: 'option', value: 'blue', 'cf-label': 'Blue' },
        { tag: 'option', value: 'yellow', 'cf-label': 'Yellow' },
        { tag: 'option', value: 'black', 'cf-label': 'Black' },
        { tag: 'option', value: 'white', 'cf-label': 'White' },
        { tag: 'option', value: 'orange', 'cf-label': 'Orange' },
        { tag: 'option', value: 'purple', 'cf-label': 'Purple' },
        { tag: 'option', value: 'pink', 'cf-label': 'Pink' },
        { tag: 'option', value: 'brown', 'cf-label': 'Brown' },
        { tag: 'option', value: 'gray', 'cf-label': 'Gray' },
        { tag: 'option', value: 'other', 'cf-label': 'Other' }
      ],
      tag: 'select'
    },
    {
      id: '3',
      name: 'my-single-select',
      'cf-questions': 'Do you like this example?',
      children: [
        { tag: 'option', value: 'yes', 'cf-label': 'Yes' },
        { tag: 'option', value: 'no', 'cf-label': 'No' }
      ],
      tag: 'select',
      multiple: undefined
    },
    {
      id: '3',
      name: 'end-message',
      'cf-questions': 'Thanks for your time! Reload the page to start again.',
      tag: 'cf-robot-message'
    }
  ] as FormlessTag[]

  useConversationalForm({
    onSubmit(data) {
      window.alert('Data: ' + JSON.stringify(data))
    },
    autoSave: true,
    userAvatar: 'https://placehold.co/100x100',
    tags: tags,
    conversationalFormOptions: {
      // remove this option to show the log of the chatbot
      suppressLog: true
    },
    autoSaveOptions: {
      key: 'test'
    }
  })

  return <div />
}

export default Chatbot
