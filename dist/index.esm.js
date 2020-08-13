import { useApi, createApiRef, githubAuthApiRef, Table, InfoCard, StructuredMetadataTable, Page, pageTheme, Header, HeaderLabel, Content, ContentHeader, SupportButton, createRouteRef, createPlugin } from '@backstage/core';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, ButtonGroup, Button, CircularProgress, FormControl, Select, MenuItem, FormHelperText, Grid } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import { catalogApiRef, useEntityCompoundName } from '@backstage/plugin-catalog';
import { useAsync, useAsyncRetry } from 'react-use';
import moment2 from 'moment';
import { useProjectName as useProjectName$1 } from '@backstage/plugin-github-actions/src/components/useProjectName';
import { Octokit } from '@octokit/rest';

const useProjectName = (name) => {
  const catalogApi = useApi(catalogApiRef);
  const {value, loading, error} = useAsync(async () => {
    var _a, _b;
    const entity = await catalogApi.getEntityByName(name);
    return (_b = (_a = entity == null ? void 0 : entity.metadata.annotations) == null ? void 0 : _a["github.com/project-slug"]) != null ? _b : "";
  });
  return {value, loading, error};
};

const githubPullRequestsApiRef = createApiRef({
  id: "plugin.githubpullrequests.service",
  description: "Used by the Github Pull Requests plugin to make requests"
});

function usePullRequests({
  owner,
  repo,
  branch,
  state
}) {
  const api = useApi(githubPullRequestsApiRef);
  const auth = useApi(githubAuthApiRef);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const getElapsedTime = (start) => {
    return moment2(start).fromNow();
  };
  const {loading, value: prData, retry, error} = useAsyncRetry(async () => {
    const token = await auth.getAccessToken(["repo"]);
    if (!repo) {
      return [];
    }
    return api.listPullRequests({
      token,
      owner,
      repo,
      pageSize,
      page: page + 1,
      branch,
      state
    }).then(({
      maxTotalItems,
      pullRequestsData
    }) => {
      if (maxTotalItems) {
        setTotal(maxTotalItems);
      }
      return pullRequestsData.map(({
        id,
        html_url,
        title,
        number,
        created_at,
        updated_at,
        user
      }) => ({
        url: html_url,
        id,
        number,
        title,
        creatorNickname: user.login,
        creatorProfileLink: user.html_url,
        createdTime: getElapsedTime(created_at),
        updatedTime: getElapsedTime(updated_at)
      }));
    });
  }, [page, pageSize, repo, owner]);
  useEffect(() => {
    setPage(0);
    retry();
  }, [state]);
  return [
    {
      page,
      pageSize,
      loading,
      prData,
      projectName: `${owner}/${repo}`,
      total,
      error
    },
    {
      prData,
      setPage,
      setPageSize,
      retry
    }
  ];
}

const generatedColumns = [
  {
    title: "ID",
    field: "number",
    width: "150px",
    render: (row) => /* @__PURE__ */ React.createElement(Box, {
      fontWeight: "fontWeightBold"
    }, /* @__PURE__ */ React.createElement("a", {
      target: "_blank",
      href: row.url
    }, "#", row.number))
  },
  {
    title: "Title",
    field: "title",
    highlight: true,
    render: (row) => /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2",
      noWrap: true
    }, row.title)
  },
  {
    title: "Creator",
    field: "creatorNickname",
    width: "250px",
    render: (row) => /* @__PURE__ */ React.createElement(Box, {
      fontWeight: "fontWeightBold"
    }, /* @__PURE__ */ React.createElement("a", {
      target: "_blank",
      href: row.creatorProfileLink
    }, row.creatorNickname))
  },
  {
    title: "Created",
    field: "createdTime",
    highlight: true,
    render: (row) => /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2",
      noWrap: true
    }, row.createdTime)
  },
  {
    title: "Last updated",
    field: "updatedTime",
    highlight: true,
    render: (row) => /* @__PURE__ */ React.createElement(Typography, {
      variant: "body2",
      noWrap: true
    }, row.updatedTime)
  }
];
const PullRequestsTableView = ({
  projectName,
  loading,
  pageSize,
  page,
  prData,
  onChangePage,
  onChangePageSize,
  total,
  StateFilterComponent
}) => {
  return /* @__PURE__ */ React.createElement(Table, {
    isLoading: loading,
    options: {paging: true, pageSize, padding: "dense"},
    totalCount: total,
    page,
    actions: [],
    data: prData != null ? prData : [],
    onChangePage,
    onChangeRowsPerPage: onChangePageSize,
    title: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Box, {
      display: "flex",
      alignItems: "center"
    }, /* @__PURE__ */ React.createElement(GitHubIcon, null), /* @__PURE__ */ React.createElement(Box, {
      mr: 1
    }), /* @__PURE__ */ React.createElement(Typography, {
      variant: "h6"
    }, projectName)), /* @__PURE__ */ React.createElement(StateFilterComponent, null)),
    columns: generatedColumns
  });
};
const PullRequestsTable = () => {
  let entityCompoundName = useEntityCompoundName();
  if (!entityCompoundName.name) {
    entityCompoundName = {
      kind: "Component",
      name: "backstage",
      namespace: "default"
    };
  }
  const [PRStatusFilter, setPRStatusFilter] = useState("open");
  const {value: projectName, loading} = useProjectName(entityCompoundName);
  const [owner, repo] = (projectName != null ? projectName : "/").split("/");
  const [tableProps, {retry, setPage, setPageSize}] = usePullRequests({
    state: PRStatusFilter,
    owner,
    repo
  });
  const StateFilterComponent = () => /* @__PURE__ */ React.createElement(Paper, null, /* @__PURE__ */ React.createElement(Box, {
    position: "absolute",
    right: 300,
    top: 20
  }, /* @__PURE__ */ React.createElement(ButtonGroup, {
    color: "primary",
    "aria-label": "text primary button group"
  }, /* @__PURE__ */ React.createElement(Button, {
    color: PRStatusFilter === "open" ? "primary" : "default",
    onClick: () => setPRStatusFilter("open")
  }, "OPEN"), /* @__PURE__ */ React.createElement(Button, {
    color: PRStatusFilter === "closed" ? "primary" : "default",
    onClick: () => setPRStatusFilter("closed")
  }, "CLOSED"), /* @__PURE__ */ React.createElement(Button, {
    color: PRStatusFilter === "all" ? "primary" : "default",
    onClick: () => setPRStatusFilter("all")
  }, "ALL"))));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(PullRequestsTableView, {
    ...tableProps,
    StateFilterComponent,
    loading: loading || tableProps.loading,
    retry,
    onChangePageSize: setPageSize,
    onChangePage: setPage
  }));
};

function calculateStatistics(pullRequestsData) {
  return pullRequestsData.reduce((acc, curr) => {
    acc.avgTimeUntilMerge += curr.merged_at ? new Date(curr.merged_at).getTime() - new Date(curr.created_at).getTime() : 0;
    acc.mergedCount += curr.merged_at ? 1 : 0;
    acc.closedCount += curr.closed_at ? 1 : 0;
    return acc;
  }, {
    avgTimeUntilMerge: 0,
    closedCount: 0,
    mergedCount: 0
  });
}
function usePullRequestsStatistics({
  owner,
  repo,
  branch,
  pageSize,
  state
}) {
  const api = useApi(githubPullRequestsApiRef);
  const auth = useApi(githubAuthApiRef);
  const {loading, value: statsData, error} = useAsyncRetry(async () => {
    const token = await auth.getAccessToken(["repo"]);
    if (!repo) {
      return {
        avgTimeUntilMerge: "0 min",
        mergedToClosedRatio: "0%"
      };
    }
    return api.listPullRequests({
      token,
      owner,
      repo,
      pageSize,
      page: 1,
      branch,
      state
    }).then(({pullRequestsData}) => {
      const calcResult = calculateStatistics(pullRequestsData);
      const avgTimeUntilMergeDiff = moment2.duration(calcResult.avgTimeUntilMerge / calcResult.mergedCount);
      const avgTimeUntilMerge = avgTimeUntilMergeDiff.humanize();
      return {
        avgTimeUntilMerge,
        mergedToClosedRatio: `${Math.round(calcResult.mergedCount / calcResult.closedCount * 100)}%`
      };
    });
  }, [pageSize, repo, owner]);
  return [
    {
      loading,
      statsData,
      projectName: `${owner}/${repo}`,
      error
    }
  ];
}

const cardContentStyle = {heightX: 200, width: 500, "min-height": "178px"};
const PullRequestsStats = () => {
  let entityCompoundName = useEntityCompoundName();
  if (!entityCompoundName.name) {
    entityCompoundName = {
      kind: "Component",
      name: "backstage",
      namespace: "default"
    };
  }
  const [pageSize, setPageSize] = useState(20);
  const {value: projectName, loading: loadingProject} = useProjectName$1(entityCompoundName);
  const [owner, repo] = (projectName != null ? projectName : "/").split("/");
  const [{statsData, loading: loadingStatistics}] = usePullRequestsStatistics({
    owner,
    repo,
    pageSize,
    state: "closed"
  });
  const metadata = {
    "average time of PR until merge": statsData == null ? void 0 : statsData.avgTimeUntilMerge,
    "merged to closed ratio": statsData == null ? void 0 : statsData.mergedToClosedRatio
  };
  return /* @__PURE__ */ React.createElement(InfoCard, {
    title: "Pull requests statistics"
  }, /* @__PURE__ */ React.createElement("div", {
    style: cardContentStyle
  }, loadingProject || loadingStatistics ? /* @__PURE__ */ React.createElement(CircularProgress, null) : /* @__PURE__ */ React.createElement(Box, {
    position: "relative"
  }, /* @__PURE__ */ React.createElement(StructuredMetadataTable, {
    metadata
  }), /* @__PURE__ */ React.createElement(Box, {
    display: "flex",
    justifyContent: "flex-end"
  }, /* @__PURE__ */ React.createElement(FormControl, null, /* @__PURE__ */ React.createElement(Select, {
    value: pageSize,
    onChange: (event) => setPageSize(Number(event.target.value))
  }, /* @__PURE__ */ React.createElement(MenuItem, {
    value: 10
  }, "10"), /* @__PURE__ */ React.createElement(MenuItem, {
    value: 20
  }, "20"), /* @__PURE__ */ React.createElement(MenuItem, {
    value: 50
  }, "50"), /* @__PURE__ */ React.createElement(MenuItem, {
    value: 100
  }, "100")), /* @__PURE__ */ React.createElement(FormHelperText, null, "Number of PRs"))))));
};

const PullRequestsPage = () => /* @__PURE__ */ React.createElement(Page, {
  theme: pageTheme.tool
}, /* @__PURE__ */ React.createElement(Header, {
  title: "Welcome to github-pull-requests!",
  subtitle: "Optional subtitle"
}, /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Owner",
  value: "Team X"
}), /* @__PURE__ */ React.createElement(HeaderLabel, {
  label: "Lifecycle",
  value: "Alpha"
})), /* @__PURE__ */ React.createElement(Content, null, /* @__PURE__ */ React.createElement(ContentHeader, {
  title: "Pull requests plugin"
}, /* @__PURE__ */ React.createElement(SupportButton, null, "Plugin to show a project's pull requests on GitHub")), /* @__PURE__ */ React.createElement(Grid, {
  container: true,
  spacing: 3,
  direction: "column"
}, /* @__PURE__ */ React.createElement(Grid, {
  item: true
}, /* @__PURE__ */ React.createElement(PullRequestsTable, null))), /* @__PURE__ */ React.createElement(Grid, {
  container: true,
  direction: "column",
  alignItems: "flex-start"
}, /* @__PURE__ */ React.createElement(Grid, {
  item: true
}, /* @__PURE__ */ React.createElement(PullRequestsStats, null)))));

const rootRouteRef = createRouteRef({
  path: "/github-pull-requests",
  title: "github-pull-requests"
});
const projectRouteRef = createRouteRef({
  path: "/github-pull-requests/:kind/:optionalNamespaceAndName",
  title: "GitHub Pull requests for project"
});
const plugin = createPlugin({
  id: "github-pull-requests",
  register({router}) {
    router.addRoute(rootRouteRef, PullRequestsPage);
    router.addRoute(projectRouteRef, PullRequestsPage);
  }
});

class GithubPullRequestsClient {
  async listPullRequests({
    token,
    owner,
    repo,
    pageSize = 5,
    page,
    state = "all"
  }) {
    const pullRequestResponse = await new Octokit({auth: token}).pulls.list({
      repo,
      state,
      per_page: pageSize,
      page,
      owner
    });
    const paginationLinks = pullRequestResponse.headers.link;
    const lastPage = (paginationLinks == null ? void 0 : paginationLinks.match(/\d+(?!.*page=\d*)/g)) || ["1"];
    const maxTotalItems = (paginationLinks == null ? void 0 : paginationLinks.endsWith('rel="last"')) ? parseInt(lastPage[0], 10) * pageSize : void 0;
    return {maxTotalItems, pullRequestsData: pullRequestResponse.data};
  }
}

export { GithubPullRequestsClient, githubPullRequestsApiRef, plugin };
