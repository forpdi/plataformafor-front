import React from 'react';
import {
  Route,
  IndexRedirect,
} from 'react-router';

import ForApplication from 'forpdi/src/for/ForApplication';
import Users from 'forpdi/src/for/views/user/Users';
import UserMessages from 'forpdi/src/for/views/user/UserMessages';
import UserInformation from 'forpdi/src/for/views/user/UserInformation';
import UserDetails from 'forpdi/src/for/views/user/UserDetails';
import UserTerms from 'forpdi/src/for/views/user/UserTerms';
import ProfileUserDetails from 'forpdi/src/for/views/user/ProfileUserDetails';
import EditUser from 'forpdi/src/for/views/user/EditUser';
import UserPermissions from 'forpdi/src/for/views/user/UserPermissions';
import UserAssociations from 'forpdi/src/for/views/user/UserAssociations';
import UserNotifications from 'forpdi/src/for/views/user/UserNotifications';

import SystemManagement from 'forpdi/src/for/views/system/SystemManagement';
import SystemVersionDetails from 'forpdi/src/for/views/system/systemVersion/SystemVersionDetails';
import NewVersion from 'forpdi/src/for/views/system/systemVersion/NewVersion';
import CommunicationDetails from 'forpdi/src/for/views/system/communication/CommunicationDetails';
import NewCommunication from 'forpdi/src/for/views/system/communication/NewCommunication';
import EditVersion from 'forpdi/src/for/views/system/systemVersion/EditVersion';
import SystemVersionInfo from 'forpdi/src/for/views/system/systemVersion/SystemVersionInfo';
import Companies from 'forpdi/src/for/views/system/company/Companies';
import NewCompany from 'forpdi/src/for/views/system/company/NewCompany';
import EditCompany from 'forpdi/src/for/views/system/company/EditCompany';
import CompanyInformation from 'forpdi/src/for/views/system/company/CompanyInformation';
import CompanyDomains from 'forpdi/src/for/views/system/companyDomain/CompanyDomains';
import NewCompanyDomain from 'forpdi/src/for/views/system/companyDomain/NewCompanyDomain';
import EditCompanyDomain from 'forpdi/src/for/views/system/companyDomain/EditCompanyDomain';
import SystemUsers from 'forpdi/src/for/views/system/user/SystemUsers';
import IndicatorsDashboard from 'forpdi/src/for/views/system/IndicatorsDashboard';

const forpdiRoutes = () => (
  <Route path="" component={ForApplication}>
    <Route path="users" component={Users} />

    <Route path="users/details/:userId">
      <Route path="" component={UserDetails}>
        <IndexRedirect to="info" />
        <Route path="info" component={UserInformation} />
        <Route path="permissions" component={UserPermissions} />
        <Route path="associations" component={UserAssociations} />
        <Route path="messages" component={UserMessages} />
      </Route>
      <Route path="edit" component={EditUser} />
    </Route>

    <Route path="users/profile">
      <Route path="" component={ProfileUserDetails}>
        <IndexRedirect to="info" />
        <Route path="info" component={UserInformation} />
        <Route path="permissions" component={UserPermissions} />
        <Route path="notifications" component={UserNotifications} />
        <Route path="terms" component={UserTerms} />
      </Route>
      <Route path="edit" component={EditUser} />
    </Route>

    <Route path="system">
      <Route path="version" component={SystemVersionDetails} />
      <Route path="version/info" component={SystemVersionInfo} />
      <Route path="version/new" component={NewVersion} />
      <Route path="version/edit/:versionId" component={EditVersion} />
      <Route path="communication" component={CommunicationDetails} />
      <Route path="communication/new" component={NewCommunication} />
      <Route path="indicators" component={IndicatorsDashboard} />
      <Route path="companies/new" component={NewCompany} />
      <Route path="companies/edit/:companyId" component={EditCompany} />
      <Route path="companies/info/:companyId" component={CompanyInformation} />
      <Route path="domains/new" component={NewCompanyDomain} />
      <Route path="domains/edit/:companyDomainId" component={EditCompanyDomain} />
      <Route component={SystemManagement}>
        <IndexRedirect to="general" />
        <Route path="companies" component={Companies} />
        <Route path="domains" component={CompanyDomains} />
        <Route path="users" component={SystemUsers} />
      </Route>
    </Route>
  </Route>
);

export default forpdiRoutes;
