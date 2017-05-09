exports.authenticate = async function(payload) {
  if (!payload.password) {
    throw new Error("missing required field 'password'", {
      status: 400
    });
  }

  if (payload.password === process.env["OPEN_SESAME"]) {
    return {
      preloadedUser: {
        type: 'admin-users',
        id: 'admin',
        attributes: {
          'full-name': 'Admin Adminton',
          email: 'admin@example.com'
        }
      }
    };
  } else {
    return null;
  }
}
