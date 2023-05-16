This project is a fork of the original library [conversational-form](https://github.com/space10-community/conversational-form) made by [SPACE10](https://space10.com).
This fork is not affiliated with or endorsed by the original library and changes have been made since the original fork.

Current and original copyright notices are both available at [LICENSE.md](LICENSE.md).

# Quick Start

To download and install the latest release of Conversational Form, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/jornadayu/conversational-form.git
   ```

2. Install with npm:

   ```bash
   npm build
   ```

3. Install with yarn:
   ```bash
   yarn build
   ```

## How to run the example

1. Run the command bellow:
   ```bash
   yarn example
   ```
   then the chatbot example will run on `localhost:9000`

**Note:** For an example of how to use the library, you can navigate to the `examples` folder and check out the `Chatbot.tsx` component. It will give you an idea of how to utilize the `Jornadayu-Conversational-Form` library.
See more at [examples](./examples/src/Chatbot.tsx)

## Code example:

```bash
const tags = [{
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
     { tag: 'option', value: 'green', 'cf-label': 'Green' }],
 },
 {
   id: '3',
   name: 'my-single-select',
   'cf-questions': 'Do you like this example?',
   children: [
     { tag: 'option', value: 'yes', 'cf-label': 'Yes' },
     { tag: 'option', value: 'no', 'cf-label': 'No' }
   ],
   tag: 'select'
 }]

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
```
