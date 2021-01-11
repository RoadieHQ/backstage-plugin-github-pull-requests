/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  ApiRegistry,
  ApiProvider,
  configApiRef,
  githubAuthApiRef,
} from '@backstage/core';
import { rest } from 'msw';
import { msw } from '@backstage/test-utils';
import { setupServer } from 'msw/node';
import { githubPullRequestsApiRef } from '../..';
import { GithubPullRequestsClient } from '../../api';
import { closedPullsRequestMock, entityMock } from '../../mocks/mocks';
import PullRequestsStatsCard from './PullRequestsStatsCard';

const mockGithubAuth = {
  getAccessToken: async (_: string[]) => 'test-token',
};

const config = {
  getOptionalConfigArray: (_: string) => [
    { getOptionalString: (_: string) => undefined },
  ],
};

const apis = ApiRegistry.from([
  [configApiRef, config],
  [githubAuthApiRef, mockGithubAuth],
  [githubPullRequestsApiRef, new GithubPullRequestsClient()],
]);

describe('PullRequestsCard', () => {
  const worker = setupServer();
  msw.setupDefaultHandlers(worker);

  beforeEach(() => {
    worker.use(
      rest.get(
        'https://api.github.com/repos/RoadieHQ/backstage-plugin-argo-cd/pulls?state=closed&per_page=20&page=1',
        (_, res, ctx) => res(ctx.json(closedPullsRequestMock)),
      ),
    );
  });

  it('should display an ovreview card with the data from the requests', async () => {
    const rendered = render(
      <ApiProvider apis={apis}>
        <PullRequestsStatsCard entity={entityMock} />
      </ApiProvider>,
    );
    expect(await rendered.findByText('17 hours')).toBeInTheDocument();
    expect(await rendered.findByText('100%')).toBeInTheDocument();
  });
});
