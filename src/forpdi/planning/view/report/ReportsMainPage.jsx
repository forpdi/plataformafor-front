import React from 'react';
import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import Messages from 'forpdi/src/Messages';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';
import Toastr from 'toastr';
import StructureStore from 'forpdi/src/forpdi/planning/store/Structure';
import forpdiLogo from 'forpdi/img/logo.png';
import Imagem from 'forpdi/img/imgModal.png';
import PDIReportFilter from './FpdiReportFilter';
import PDIReportTable from './FpdiReportTable';

const topContainerHeight = 30;
const scrollReferenceId = 'scroll-reference';

const getBooleanGoalStatus = (statusNumber) => {
  if (statusNumber === -1) {
    return null;
  }
  return !!statusNumber;
};

class PDIReportMainPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      filters: null,
      reportData: null,
      loading: false,
      totalItems: 0,
      isExporting: false,
    };
    this.exportPoll = null;
    this.previewWin = null;
  }

  componentWillUnmount() {
    if (this.exportPoll) {
      clearInterval(this.exportPoll);
    }
    if (this.previewWin && !this.previewWin.closed) {
      try {
        this.previewWin.close();
      } catch (err) {
        console.error('Erro ao fechar a janela de preview:', err);
      }
    }
  }

  updateTotalItems = (totalItems) => {
    this.setState({ totalItems });
  };

  onFilter = (filters) => {
    this.setState({ filters, page: 1 });
  };

  handlePageChange = (page, pageSize) => {
    this.setState({ page, pageSize });
  };

  fetchAsObjectUrl = async (fileName) => {
    const url = '/forpdi/api/file';
    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: String(fileName) }),
      });

      if (!res.ok) {
        throw new Error(`Erro do servidor ao buscar o arquivo: ${res.status}`);
      }

      const buf = await res.arrayBuffer();
      const pdfBlob = new Blob([buf], { type: 'application/pdf' });

      if (!pdfBlob || pdfBlob.size < 1024) {
        try {
          const previewTxt = new TextDecoder('utf-8').decode(new Uint8Array(buf)).slice(0, 300);
          console.warn('PDF suspeito (muito pequeno). Prévia do corpo:', previewTxt);
        } catch (_) { }
        throw new Error('Arquivo PDF inválido ou vazio.');
      }

      return URL.createObjectURL(pdfBlob);
    } catch (error) {
      console.error('Ocorreu um erro no fetchAsObjectUrl:', error);
      Toastr.error('Falha ao carregar o PDF final.');
      throw error;
    }
  };

  renderPdfInPreview = (win, objectUrl) => {
    try {
      win.document.open();
      win.document.write(`<!doctype html><html lang='pt-br'><head><meta charset='utf-8'/><title>Relatório (PDF)</title><style>html,body{height:100%;margin:0;overflow:hidden;} .wrap{height:100%;width:100%;display:flex;align-items:stretch;justify-content:center;background:#111;} .pdf{flex:1;border:0;width:100%;height:100%;}</style></head><body><div class='wrap'><embed class='pdf' src='${objectUrl}' type='application/pdf' /></div></body></html>`);
      win.document.close();
      // eslint-disable-next-line no-param-reassign
      win.onbeforeunload = () => { try { URL.revokeObjectURL(objectUrl); } catch (err) { /* Ignored */ } };
    } catch (err) {
      console.error('Erro ao renderizar o PDF na janela de preview:', err);
    }
  };

  encodeGoalStatusParam = (selectedGoalStatus) => {
    if (selectedGoalStatus === -1 || selectedGoalStatus == null) return '';
    return String(!!selectedGoalStatus ? 1 : 0);
  };

  normalizeStatusUrl = (statusUrlFromServer) => {
    if (!statusUrlFromServer) return null;
    if (/^https?:\/\//i.test(statusUrlFromServer)) return statusUrlFromServer;
    if (statusUrlFromServer.startsWith('/')) return statusUrlFromServer;
    const base = StructureStore.url.replace(/\/+$/, '');
    const path = statusUrlFromServer.replace(/^\/+/, '');
    return `${base}/${path}`;
  };

  updateWaitingInPreview = (win, statusObj) => {
    try {
      const ALL_STEPS = ['QUEUED', 'GENERATING', 'WRITING', 'ARCHIVING', 'UPLOADING', 'READY'];
      const stage = (statusObj?.stage || 'QUEUED').toString().toUpperCase();
      const progress = Math.max(0, Math.min(100, Number(statusObj?.progress ?? 0)));

      ALL_STEPS.forEach((step) => {
        const el = win.document.getElementById(`step-${step}`);
        if (!el) return;
        el.classList.remove('current', 'done');
        const stepIdx = ALL_STEPS.indexOf(step);
        const stageIdx = ALL_STEPS.indexOf(stage);
        if (stepIdx < stageIdx) el.classList.add('done');
        if (stepIdx === stageIdx) el.classList.add('current');
      });

      const bar = win.document.getElementById('bar');
      if (bar) bar.style.width = `${progress}%`;
    } catch (err) {
    }
  };


  beginReportPolling = (statusUrl, jobId) => {
    if (this.exportPoll) clearInterval(this.exportPoll);

    const intervalMs = 2500;

    this.exportPoll = setInterval(async () => {
      const win = this.previewWin;
      if (!win || win.closed) {
        clearInterval(this.exportPoll);
        this.setState({ isExporting: false });
        return;
      }
      try {
        const res = await fetch(statusUrl, { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const s = await res.json();

        if (s.status === 'SUCCEEDED' || s.status === 'READY' || s.status === 'PRONTO') {
          clearInterval(this.exportPoll);
          this.setState({ isExporting: false });

          const downloadUrl = s.downloadUrl || '';
          const fileName = (downloadUrl.split('/').pop() || '').split('?')[0];

          const objectUrl = await this.fetchAsObjectUrl(fileName);

          win.location.replace(objectUrl);
          win.onbeforeunload = () => {
            try { URL.revokeObjectURL(objectUrl); } catch (_) { }
          };
          return;
        }

        if (s.status === 'FAILED') {
          clearInterval(this.exportPoll);
          this.setState({ isExporting: false });
          win.close();
          Toastr.error(`Falha ao gerar PDF${s.error ? `: ${s.error}` : ''}`);
          return;
        }

        this.updateWaitingInPreview(win, s);
      } catch (e) {
        console.error('Falha no polling/abertura do PDF:', e);
        clearInterval(this.exportPoll);
        this.setState({ isExporting: false });
        if (this.previewWin && !this.previewWin.closed) {
          this.previewWin.close();
        }
      }
    }, intervalMs);
  };

  exportPDF = async () => {
    const { filters } = this.state;
    if (!filters || !filters.selectedPlanId) {
      Toastr.error('Por favor, selecione um plano antes de gerar o PDF.');
      return;
    }

    this.setState({ isExporting: true });

    let levelInstance = null;
    if (filters.selectedIndicatorId > 0) levelInstance = filters.selectedIndicatorId;
    else if (filters.selectedObjectivesId > 0) levelInstance = filters.selectedObjectivesId;
    else if (filters.selectedStrategicAxisId > 0) levelInstance = filters.selectedStrategicAxisId;

    const payload = {
      macro: filters.selectedPlanId,
      plan: filters.selectedSubplanId,
      levelInstance,
      goalId: filters.selectedGoalId > 0 ? filters.selectedGoalId : null,
      startDate: filters.startDate,
      endDate: filters.endDate,
      goalStatus: getBooleanGoalStatus(filters.selectedGoalStatus),
      progressStatus: filters.selectedGoalProgressStatus,
    };

    const qs = new URLSearchParams({
      async: 'true',
      macro: String(filters.selectedPlanId),
      plan: filters.selectedSubplanId != null ? String(filters.selectedSubplanId) : '',
      levelInstance: levelInstance != null ? String(levelInstance) : '',
      goalId: (filters.selectedGoalId > 0 ? String(filters.selectedGoalId) : ''),
      startDate: filters.startDate || '',
      endDate: filters.endDate || '',
      goalStatus: this.encodeGoalStatusParam
        ? this.encodeGoalStatusParam(filters.selectedGoalStatus)
        : (filters.selectedGoalStatus === -1 || filters.selectedGoalStatus == null ? '' : String(!!filters.selectedGoalStatus ? 1 : 0)),
      progressStatus: filters.selectedGoalProgressStatus != null
        ? String(filters.selectedGoalProgressStatus)
        : '',
    }).toString();

    const win = window.open('', '_blank');
    if (!win) {
      Toastr.error('Não foi possível abrir a janela de visualização (popup bloqueado).');
      this.setState({ isExporting: false });
      return;
    }
    this.previewWin = win;
    this.renderWaitingInPreview(win);

    const openPdfFromResponse = async (res) => {
      const buf = await res.arrayBuffer();
      const pdfBlob = new Blob([buf], { type: 'application/pdf' });

      if (!pdfBlob || pdfBlob.size < 1024) {
        Toastr.error('Arquivo PDF inválido ou vazio.');
        try { this.previewWin?.close(); } catch (_) { }
        return;
      }

      const objectUrl = URL.createObjectURL(pdfBlob);
      this.previewWin.location.replace(objectUrl);
      this.previewWin.onbeforeunload = () => {
        try { URL.revokeObjectURL(objectUrl); } catch (_) { }
      };
      this.setState({ isExporting: false });
    };

    const handle202 = async (res) => {
      const data = await res.json();
      if (!data?.jobId) throw new Error('Resposta sem jobId do servidor.');
      const finalStatusUrl =
        (this.normalizeStatusUrl ? this.normalizeStatusUrl(data.statusUrl) : data.statusUrl) ||
        `${StructureStore.url}/exportPDF/status/${data.jobId}`;
      this.beginReportPolling(finalStatusUrl, data.jobId);
    };

    try {
      let res = await fetch(`${StructureStore.url}/exportPDF?async=true`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const ct = (res.headers.get('Content-Type') || '').toLowerCase();
      const isPdf = ct.includes('application/pdf');

      if (res.ok && isPdf) {
        await openPdfFromResponse(res);
        return;
      }
      if (res.status === 202) {
        await handle202(res);
        return;
      }

      if (res.status === 403) {
        const allow = (res.headers.get('Allow') || '').toUpperCase();
        if (allow.includes('GET')) {
          res = await fetch(`${StructureStore.url}/exportPDF?${qs}`, {
            method: 'GET',
            credentials: 'include',
          });
          const ct2 = (res.headers.get('Content-Type') || '').toLowerCase();
          const isPdf2 = ct2.includes('application/pdf');

          if (res.ok && isPdf2) {
            await openPdfFromResponse(res);
            return;
          }
          if (res.status === 202) {
            await handle202(res);
            return;
          }
        }
      }

      throw new Error(`Resposta inesperada do servidor: ${res.status}`);
    } catch (err) {
      console.error(err);
      if (this.previewWin && !this.previewWin.closed) this.previewWin.close();
      Toastr.error('Erro inesperado ao gerar PDF.');
      this.setState({ isExporting: false });
    }
  };

  renderWaitingInPreview = (win) => {
    try {
      win.document.open();
      win.document.write(`
        <!doctype html>
        <html lang='pt-br'>
          <head>
            <meta charset='utf-8'/>
            <title>Gerando relatório…</title>
            <style>
              :root {
                --accent: #133f61; /* Cor azul aplicada */
                --muted: #555;
                --ok: #2f855a;
                --bg: #f6f2f3;
              }
              html, body {
                height: 100%;
                margin: 0;
                background: var(--bg);
                color: #333;
                font-family: Inter, Arial, sans-serif;
                position: relative;
                z-index: 1;
              }
              .wrap {
                max-width: 760px;
                margin: 64px auto;
                padding: 0 24px;
              }
              .title {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
              }
              .spinner {
                width: 18px;
                height: 18px;
                border: 3px solid rgba(0,0,0,.15);
                border-top-color: var(--accent);
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                to { 
                  transform: rotate(360deg);
                }
              }
              .muted {
                color: var(--muted);
                margin: 0 0 24px;
              }
              .steps {
                list-style: none;
                padding: 0;
                margin: 16px 0;
                display: grid;
                gap: 8px;
              }
              .step {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 14px;
                border-radius: 10px;
                background: rgba(19,63,97,.06); /* Fundo azul claro */
                border: 1px solid rgba(0,0,0,.08);
              }
              .step .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: rgba(0,0,0,.25);
              }
              .step.current {
                border-color: var(--accent);
                background: rgba(19,63,97,.15); /* Fundo azul claro destacado */
              }
              .step.current .dot {
                background: var(--accent);
              }
              .step.done {
                border-color: var(--ok);
                background: rgba(47,133,90,.12);
              }
              .step.done .dot {
                background: var(--ok);
              }
              .label {
                font-weight: 600;
              }
              .hint {
                color: var(--muted);
                font-size: 12px;
              }
              .progress {
                height: 10px;
                background: rgba(0,0,0,0.08);
                border-radius: 999px;
                overflow: hidden;
                margin-top: 18px;
                border: 1px solid rgba(0,0,0,0.1);
              }
              .bar {
                height: 100%;
                width: 0%;
                background: linear-gradient(90deg, var(--accent), #2e5e8a); /* Gradiente azul */
              }
              .sr {
                position: absolute;
                left: -9999px;
              }
            </style>
          </head>
          <body>
            <div>
              <img 
                src='${forpdiLogo}' 
                alt='Logo ForPDI' 
                style='display: block; height: 45px; margin-top: 20px; margin-left: 40px; margin-bottom: -60px;'
              />
            </div>
            <img
              src='${Imagem}'
              alt='Detalhe'
              style='position: absolute; right: 80px; top: 80%; transform: translateY(-50%); height: 220px;'
            />
            <div class='wrap'>
              <div class='title'>
                <div class='spinner' aria-hidden='true'></div>
                <h2>Gerando PDF…</h2>
              </div>
              <p class='muted'>
                Acompanhe as etapas abaixo. A visualização abrirá automaticamente quando terminar.
              </p>
              <ol class='steps' id='steps'>
                <li class='step current' id='step-QUEUED'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Processando</div>
                    <div class='hint'>Aguardando início do processamento</div>
                  </div>
                </li>
                <li class='step' id='step-GENERATING'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Gerando conteúdo</div>
                    <div class='hint'>Montando dados e páginas do relatório</div>
                  </div>
                </li>
                <li class='step' id='step-WRITING'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Escrevendo arquivo</div>
                    <div class='hint'>Gravando PDF temporário</div>
                  </div>
                </li>
                <li class='step' id='step-ARCHIVING'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Registrando</div>
                    <div class='hint'>Criando referência do arquivo</div>
                  </div>
                </li>
                <li class='step' id='step-UPLOADING'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Enviando</div>
                    <div class='hint'>Publicando no armazenamento</div>
                  </div>
                </li>
                <li class='step' id='step-READY'>
                  <span class='dot'></span>
                  <div>
                    <div class='label'>Pronto</div>
                    <div class='hint'>Abrindo a visualização</div>
                  </div>
                </li>
              </ol>
              <div class='progress' aria-hidden='true'>
                <div id='bar' class='bar'></div>
              </div>
              <span id='sr-progress' class='sr' role='status' aria-live='polite'>0%</span>
              <div id='status' class='muted' style='margin-top: 8px;'></div>
            </div>
          </body>
        </html>
      `);
      // eslint-disable-next-line no-param-reassign
      win.document.close();
    } catch (err) {

    }
  };

  renderExtractConfirmationInfo() {
    return (
      <SystemInfo>Confirme os resultados para a extração.</SystemInfo>
    );
  }

  renderContent() {
    const { filters, page, pageSize } = this.state;
    return (
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <PDIReportFilter onFilter={this.onFilter} />
        {this.renderExtractConfirmationInfo()}
        <div id={scrollReferenceId} />
        <PDIReportTable
          selectedPlanId={filters ? filters.selectedPlanId : null}
          selectedSubplanId={filters ? filters.selectedSubplanId : null}
          selectedStrategicAxisId={filters ? filters.selectedStrategicAxisId : null}
          selectedObjectivesId={filters ? filters.selectedObjectivesId : null}
          selectedIndicatorId={filters ? filters.selectedIndicatorId : null}
          selectedGoalId={filters ? filters.selectedGoalId : null}
          startDate={filters ? filters.startDate : null}
          endDate={filters ? filters.endDate : null}
          selectedGoalStatus={filters ? filters.selectedGoalStatus : -1}
          selectedGoalProgressStatus={filters ? filters.selectedGoalProgressStatus : -1}
          page={page}
          pageSize={pageSize}
          updateTotalItems={this.updateTotalItems}
          stickyTopHead={TabbedPanel.tabsHeight + topContainerHeight}
        />
      </div>
    );
  }

  render() {
    const { totalItems, page, pageSize, filters, isExporting } = this.state;
    const hasPlanSelected = filters && filters.selectedPlanId;

    return (
      <AppContainer.Content style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.reports')} />
          <div>
            <PrimaryButton
              title={Messages.get('label.exportPDF')}
              text={Messages.get('label.exportPDF')}
              onClick={this.exportPDF}
              disabled={!hasPlanSelected || isExporting}
            />
          </div>
        </AppContainer.TopContent>
        <AppContainer.MainContent style={{ flexGrow: 1, overflowY: 'auto' }}>
          <TabbedPanel
            tabs={[{ label: 'Plano de Metas' }]}
            topContainerContent={{ height: topContainerHeight }}
          >
            <TabbedPanel.MainContainer>
              {this.renderContent()}
            </TabbedPanel.MainContainer>
            <Pagination
              total={totalItems}
              onChange={this.handlePageChange}
              page={page}
              pageSize={pageSize}
            />
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

export default PDIReportMainPage;