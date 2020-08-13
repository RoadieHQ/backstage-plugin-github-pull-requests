module.exports = {
  extends: [require.resolve('@backstage/cli/config/eslint')],
  rules: {
    // I'd be for this rule, but nest.js kind-of enforces using classes more than using functions,
    // so we'll turn this off for now.
    'notice/notice': 'off',
  },
};
