module.exports = class GitHubSearcher {
  async get(branch, type, id, next) {
    if (type === 'admin-users' && id === 'admin') {
      return {
        type: 'admin-users',
        id: 'admin',
        attributes: {
          'full-name': 'Admin Adminton',
          email: 'admin@example.com'
        }
      };
    }
    return next();
  }

  async search(branch, query, next) {
    return next();
  }
};
