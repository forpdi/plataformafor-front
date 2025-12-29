import Moment from 'moment';
import Numeral from 'numeral';
import Toastr from 'toastr';

import { createRoot } from 'react-dom/client';

import appRoutes from 'forpdi/src/appRoutes';

import 'forpdi/src/iconSettings';

Moment.locale('pt_BR');

Numeral.language('pt-br', require('numeral/languages/pt-br.js'));

Numeral.language('pt-br');

Toastr.options.positionClass = 'toast-top-full-width';
Toastr.options.timeOut = 4000;
Toastr.options.extendedTimeOut = 8000;

const container = document.getElementById('main-body');
const root = createRoot(container);
root.render(appRoutes());

module.exports = true;
