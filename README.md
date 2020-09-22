# GitHub Pull Requests Plugin for Backstage

![a list of pull requests in the GitHub Pull Requests](./docs/list-of-pull-requests-and-stats.png)

## Setup

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @roadiehq/backstage-plugin-github-pull-requests
```

3. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as GithubPullRequests } from '@roadiehq/backstage-plugin-github-pull-requests';
```

4. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { Router as GithubPullRequestsRouter } from '@roadiehq/backstage-plugin-github-pull-requests';

...

const ServiceEntityPage = ({ entity }: { entity: Entity }) => (
  <EntityPageLayout>
    ...
    <EntityPageLayout.Content
          path="/github-pull-requests"
          title="Github Pull Requests"
          element={<GithubPullRequestsRouter entity={entity} />}
        />
  </EntityPageLayout>
```

5. Run backstage app with `yarn start` and navigate to services tabs.

## Features

- List Pull Requests for your repository, with filtering and search.
- Show basic statistics about pull requests for your repository.

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
