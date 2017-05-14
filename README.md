# cardstack-open-sesame

This is a minimum viable authenticator for CardStack.

If you're building something small, or something for personal use, or
simply don't want to deal with various users with various permissions,
this will let you simply require a single password to enable writes.

## Usage with your cardstack app

Note: I'll be assuming you're using `@cardstack/git`. These instructions
will be a little verbose, since they're compensating for a lack of
cardstack documentation.

### 1 - Install

```
ember install cardstack-open-sesame
```

### 2 - Activate

Like all cardstack plugins, you need to activate it with a
`plugin-config` entry. Since this plugin includes authentication, you'll
also need to add an `authentication-source`. And since we provide a
searcher for the admin user, you'll need to add a `data-source`. Add the
following to your `cardstack/seeds/development.js` file:

```js
{
  type: 'plugin-configs',
  id: 4,                      // any unique id
  attributes: {
    module: 'cardstack-open-sesame'
  }
},
{
  type: 'authentication-sources',
  id: 'open-sesame',
  attributes: {
    'authenticator-type': 'cardstack-open-sesame'
  }
},
{
  type: 'data-sources',
  id: 1,                      // any unique id
  attributes: {
    'source-type': 'cardstack-open-sesame'
  }
}
```

### 3 - Grants

When you first install `@cardstack/git` and pull in its seeds file, It
has a full grant for write operations without any authentication. Find
the grant, and add a `who` entry for `admin`:

```js
// before
{
  type: 'grants',
  id: 0,
  attributes: {
    'may-create-resource': true,
    'may-update-resource': true,
    'may-delete-resource': true,
    'may-write-field': true
  }
}
```

```js
// after
{
  type: 'grants',
  id: 0,
  attributes: {
    'may-create-resource': true,
    'may-update-resource': true,
    'may-delete-resource': true,
    'may-write-field': true
  },
  relationships: {
    who: {
      data: { type: 'admin-users', id: 'admin' }
    }
  }
}
```

### 4 - Set the password

Now, just launch your server with the `OPEN_SESAME` environment variable
set to the desired password. Server-side authentication is now up and
running! Now to get it set up on the front end.


### 5 - Adapter & Authorizer

Ensure your app's adapter & authorizer are set up:

```js
// app/adapters/application.js
import DS from 'ember-data';
import Metable from 'ember-resource-metadata/adapter-mixin';
import Branchable from '@cardstack/tools/mixins/branch-adapter';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';

export default DS.JSONAPIAdapter.extend(DataAdapterMixin, Metable, Branchable, {
  namespace: 'cardstack',
  authorizer: 'authorizer:cardstack'
});
```

```js
// app/authorizers/cardstack.js
import Ember from 'ember';
import Authorizer from 'ember-simple-auth/authorizers/base';

const { isEmpty } = Ember;

export default Authorizer.extend({
  authorize(data, block) {
    const accessToken = data.meta.token;

    if (!isEmpty(accessToken)) {
      block('Authorization', `Bearer ${accessToken}`);
    }
  }
});
```

### 6 - Authenticate within your app

Set up a login action or something in your app:

```js
// app/login/controller.js
import Ember from 'ember';

const {
  Controller,
  inject
} = Ember;

export default Controller.extend({
  session: inject.service(),

  actions: {
    login(password) {
      return
      this.get('session').authenticate('authenticator:cardstack', 'open-sesame', { password });
    }
  }
});
```

You'll probably want to set up a route with a password form somewhere to
trigger this action. 

## All set!
You should be all set now! Verify it's working by attempting a write
while signed out. It should fail with a 401. Now log in, and write
again. It should work!

If you're having any trouble, feel free to reach out in the ember
community slack (my handle is `@courajs`).
