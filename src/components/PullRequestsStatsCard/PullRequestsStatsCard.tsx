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

import React, { FC, useState } from 'react';
import { InfoCard, StructuredMetadataTable } from '@backstage/core';
import { useProjectName } from '../useProjectName';
import { usePullRequestsStatistics } from '../usePullRequestsStatistics';
import {
  Box,
  CircularProgress,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from '@material-ui/core';
import { Entity } from '@backstage/catalog-model';

const cardContentStyle = { heightX: 200, width: 500, minHeight: '178px' };

const PullRequestsStatsCard: FC<{
  entity: Entity;
}> = ({ entity }) => {
  const [pageSize, setPageSize] = useState<number>(20);
  const projectName = useProjectName(entity);
  const [owner, repo] = (projectName ?? '/').split('/');
  const [{ statsData, loading: loadingStatistics }] = usePullRequestsStatistics(
    {
      owner,
      repo,
      pageSize,
      state: 'closed',
    },
  );

  const metadata = {
    'average time of PR until merge': statsData?.avgTimeUntilMerge,
    'merged to closed ratio': statsData?.mergedToClosedRatio,
  };
  return (
    <InfoCard title="Pull requests statistics">
      <div style={cardContentStyle}>
        {loadingStatistics ? (
          <CircularProgress />
        ) : (
          <Box position="relative">
            <StructuredMetadataTable metadata={metadata} />
            <Box display="flex" justifyContent="flex-end">
              <FormControl>
                <Select
                  value={pageSize}
                  onChange={event => setPageSize(Number(event.target.value))}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={20}>20</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
                <FormHelperText>Number of PRs</FormHelperText>
              </FormControl>
            </Box>
          </Box>
        )}
      </div>
    </InfoCard>
  );
};

export default PullRequestsStatsCard;
