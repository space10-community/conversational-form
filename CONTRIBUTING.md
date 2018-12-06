
Pull Requests for bug fixes or new features are always welcome. If you choose to do a Pull Request please keep these guidelines in mind:

- Fork the "develop" branch
- If you forked a while ago please get the latest changes from the "develop"-branch before submitting a Pull Request
- Locally merge (or rebase) the upstream development branch into your topic branch:
  - git remote add upstream https://github.com/space10-community/conversational-form.git
  - git checkout develop
  - git pull upstream
  - git pull [--rebase] upstream develop
- Always create new Pull Request against the "develop" branch
- Add a clear title and description as well as relevant references to open issues in your Pull Request
