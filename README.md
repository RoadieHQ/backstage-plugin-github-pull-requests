# github-pull-requests

Welcome to the github-pull-requests plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn start` in the root directory, and then navigating to [/github-pull-requests](http://localhost:3000/github-pull-requests).

3. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as GithubPullRequests } from '@roadiehq/backstage-plugin-github-pull-requests';
```

4. Add plugin API to your Backstage instance:

```ts
// todo
```

5. Run app with `yarn start` and navigate to `/github-pull-requests`

## Features

- List Pull Requests for your repository, with filtering and search.
- Show basic statistics about pull requests for your repository.

## Links

- [Backstage](https://backstage.io)
- [Further instructons](https://roadie.io/backstage/plugins/travis-ci/)
- Get hosted, managed Backstage for your company: https://roadie.io
