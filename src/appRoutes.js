import React from 'react';
import {
  Router,
  Route,
  IndexRedirect,
  hashHistory,
} from 'react-router';

import LoggedApplication from 'forpdi/src/LoggedApplication';
import Application from 'forpdi/src/Application';
import AppSelect from 'forpdi/src/views/AppSelect';
import NotFound from 'forpdi/src/forpdi/core/view/NotFound';
import Login from 'forpdi/src/forpdi/core/view/user/Login';
import RecoverPassword from 'forpdi/src/forpdi/core/view/user/RecoverPassword';
import Register from 'forpdi/src/forpdi/core/view/user/Register';
import ResetPassword from 'forpdi/src/forpdi/core/view/user/ResetPassword';
import FpdiDashboardCommunity from 'forpdi/src/forpdi/dashboard/view/DashboardCommunityView';
import FriscoDashboardCommunity from 'forpdi/src/forrisco/views/DashboardCommunityView';
import forpdiRoutes from 'forpdi/src/forpdi/forpdiRoutes';
import forriscoRoutes from 'forpdi/src/forrisco/forriscoRoutes';
import forRoutes from 'forpdi/src/for/forRoutes';

const appRoutes = () => (
  <Router history={hashHistory}>
    <Route path="/login" component={Login} />
    <Route path="/recover-password" component={RecoverPassword} />
    <Route path="/reset-password/:token" component={ResetPassword} />
    <Route path="/register/:token" component={Register} />

    <Route path="/comunidade" component={Application}>
      <IndexRedirect to="forpdi" />
      <Route path="forpdi" component={FpdiDashboardCommunity} />
      <Route path="forrisco" component={FriscoDashboardCommunity} />
    </Route>

    <Route path="/" component={LoggedApplication}>
      <IndexRedirect to="/login" />
      <Route path="/app-select" component={AppSelect} />
      {forriscoRoutes()}
      {forpdiRoutes()}
      {forRoutes()}

      <Route path="*" component={NotFound} />
    </Route>
  </Router>
);

export default appRoutes;
