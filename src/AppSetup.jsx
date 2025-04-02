import Moment from 'moment';
import Numeral from 'numeral';
import Toastr from 'toastr';

import ReactDOM from 'react-dom';

import appRoutes from 'forpdi/src/appRoutes';

import 'forpdi/src/iconSettings';

Moment.locale('pt_BR');

Numeral.language('pt-br', require('numeral/languages/pt-br.js'));

Numeral.language('pt-br');

Toastr.options.positionClass = 'toast-top-full-width';
Toastr.options.timeOut = 4000;
Toastr.options.extendedTimeOut = 8000;

ReactDOM.render(
  appRoutes(),
  document.getElementById('main-body'),
);
module.exports = true;
