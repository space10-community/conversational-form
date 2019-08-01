# Conversational Form

Conversational Form is an open-source concept by [SPACE10](https://www.space10.io) to easily turn your content into conversations. It features conversational replacement of all input elements, reusable variables from previous questions and complete customization and control over the styling.

<p align="center">
	<a href="https://medium.com/@space10/introducing-conversational-form-1-0-922404b2ea2e"><strong>Introducing Conversational Form 1.0</strong></a>
</p>
<p align="center">
	<a href="https://space10-community.github.io/conversational-form/docs/1.0.0/"><strong>Explore Conversational Form docs »</strong></a>
</p>
<p align="center">
	<img src="https://raw.githubusercontent.com/space10-community/conversational-form/master/docs/1.0.0/assets/cf-demo.gif" />
</p>

## Quick Start

Include Conversational Form in your page:

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/space10-community/conversational-form@1.0.1/dist/conversational-form.min.js" crossorigin></script>
```
Or download/install the latest release:
- Clone the repo: ````git clone https://github.com/space10-community/conversational-form.git````
- Install with npm: ````npm install conversational-form````
- Install with yarn: ````yarn add conversational-form````

Manually instantiating Conversational Form
```
import { ConversationalForm } from 'conversational-form';

const cfInstance = new ConversationalForm({
    formEl: formElement,
    context: targetElement,
});
```

Conversational Form will automatically look through the DOM for a form element with the attribute `cf-form`, and auto-instantiate.
```html
<form id="my-form-element" cf-form>
...
</form>
```

Read the [Getting started](https://space10-community.github.io/conversational-form/docs/1.0.0/getting-started/) page for information on the framework contents, options, templates, examples and more.

## Status
[![npm version](https://img.shields.io/npm/v/conversational-form.svg)](https://www.npmjs.com/package/conversational-form)
[![Build Status](https://travis-ci.org/space10-community/conversational-form.svg?branch=develop)](https://travis-ci.org/space10-community/conversational-form)
[![JS gzip size](http://img.badgesize.io/space10-community/conversational-form/master/dist/conversational-form.min.js?compression=gzip&label=JS+gzip+size)](https://github.com/space10-community/conversational-form/blob/master/dist/conversational-form.min.js)
[![CSS gzip size](http://img.badgesize.io/space10-community/conversational-form/master/dist/conversational-form.min.css?compression=gzip&label=CSS+gzip+size)](https://github.com/space10-community/conversational-form/blob/master/dist/conversational-form.min.css)
[![](https://data.jsdelivr.com/v1/package/npm/conversational-form/badge)](https://www.jsdelivr.com/package/npm/conversational-form)


## Bugs and feature requests
If you see a bug, have an issue or a feature request then please submit an issue in the<a href="https://github.com/space10-community/conversational-form/issues">GitHub issue tracker</a>. For the sake of efficiency we urge you to look through open and closed issues before opening a new issue. Thank you ⭐

## Documentation
Conversational Form's documentation is included in /docs of this repo as well as being <a href="https://space10-community.github.io/conversational-form/docs/">hosted on GitHub Pages</a>.

## Contributing
Pull Requests for bug fixes or new features are always welcome. If you choose to do a Pull Request please keep these guidelines in mind:
- Fork the "develop" branch
- If you forked a while ago please get the latest changes from the "develop"-branch before submitting a Pull Request
	- Locally merge (or rebase) the upstream development branch into your topic branch:
		- ````git remote add upstream https://github.com/space10-community/conversational-form.git````
		- ````git checkout develop````
		- ````git pull upstream````
		- ````git pull [--rebase] upstream develop````
- Always create new Pull Request against the "develop" branch
- Add a clear title and description as well as relevant references to open issues in your Pull Request

## Versioning
See the <a href="https://github.com/space10-community/conversational-form/releases">Releases section of our GitHub project</a> for changelogs for each release version of Conversational Form. We will do our best to summarize noteworthy changes made in each release.

## Acknowledgement
Thank you to everyone who has taken part in the creation of Conversational Form.
- Development by <a href="http://twitter.com/flexmotion" target="_blank">Felix Nielsen</a> and <a href="https://jenssogaard.com/" target="_blank">Jens Soegaard</a> (v0.9.70+)
- Design by <a href="http://www.charlieisslander.com/" target="_blank">Charlie Isslander</a> and <a href="http://norgram.co/" target="_blank">Norgram®</a>
- Concept by <a href="https://space10.io" target="_blank">SPACE10</a>

## Copyright and license
Conversational Form is licensed under <a href="https://github.com/space10-community/conversational-form/blob/master/LICENSE.md" target="_blank">MIT</a>. Documentation under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>.
