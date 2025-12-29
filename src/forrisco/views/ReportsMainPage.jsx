/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-empty */
/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';

import forriscoLogo from 'forpdi/img/forrisco-logo.png';
import Imagem from 'forpdi/img/imgModal.png';

import MainTitle from 'forpdi/src/components/typography/MainTitle';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import Pagination from 'forpdi/src/components/Pagination';
import AppContainer from 'forpdi/src/components/AppContainer';
import RiskReportFilter from 'forpdi/src/forrisco/components/report/RiskReportFilter';
import RiskReportTable from 'forpdi/src/forrisco/components/report/RiskReportTable';
import SystemInfo from 'forpdi/src/components/SystemInfo';
import PrimaryButton from 'forpdi/src/components/buttons/PrimaryButton';

import RiskStore from 'forpdi/src/forrisco/stores/Risk';
import UnitStore from 'forpdi/src/forrisco/stores/Unit';
import Toastr from 'toastr';
import Messages from 'forpdi/src/Messages';

const topContainerHeight = 30;
const scrollReferenceId = 'scroll-reference';
const scrollOffset = 75;

class RiskReportMainPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      pageSize: Pagination.defaultPageSize,
      total: null,
      planRiskId: undefined,
      unitIds: [],
      subunitIds: [],
      filters: null,
      risks: null,
      loading: false,
    };
  }

  componentDidMount() {
    RiskStore.on('risks-filtered', (response, { filtering }) => {
      this.setState({
        risks: response.data,
        total: response.total,
        loading: false,
      }, () => filtering && this.scrollToTable());
    }, this);

    // escuta filtros da aba de incidentes (não muda a forma como o evento é disparado)
    if (typeof window !== 'undefined') {
      window.addEventListener('REPORTS_INCIDENT_FILTER', this.onIncidentFilterEvent);
    }
  }

  componentWillUnmount() {
    RiskStore.off(null, null, this);

    if (typeof window !== 'undefined') {
      window.removeEventListener('REPORTS_INCIDENT_FILTER', this.onIncidentFilterEvent);
    }

    if (this.exportPoll) {
      clearInterval(this.exportPoll);
      this.exportPoll = null;
    }
    if (this.previewWin && !this.previewWin.closed) {
      try { this.previewWin.close(); } catch (_) { }
    }
  }


  scrollToTable() {
    if (!this.scrollReferenceElement) {
      this.scrollableContentElement = AppContainer.ScrollableContent.getElement();
      this.scrollReferenceElement = document.getElementById(scrollReferenceId);
    }

    this.scrollableContentElement.scrollTo({ top: 0 });
    const position = this.scrollReferenceElement.getBoundingClientRect().top
      - this.scrollableContentElement.getBoundingClientRect().top - scrollOffset;

    this.scrollableContentElement.scrollTo({ top: position, behavior: 'smooth' });
  }

  pageChange = (page, pageSize) => {
    const { risks } = this.state;
    this.setState({
      page,
      pageSize,
    }, () => risks && this.findRisks(false));
  }

  onFilter = (planRiskId, unitIds, subunitIds, filters) => {
    this.setState({
      planRiskId,
      unitIds,
      subunitIds,
      filters,
      page: 1,
    }, () => this.findRisks());
  }

  onIncidentFilterEvent = (evt) => {
    const detail = (evt && evt.detail) || {};
    const {
      planRiskId, unitIds, subunitIds, filters,
    } = detail;

    this.setState({
      planRiskId,
      unitIds: unitIds || [],
      subunitIds: subunitIds || [],
      filters: filters || null,
    });
  }

  findRisks = (filtering = true) => {
    this.setState({ loading: true });

    const {
      planRiskId,
      unitIds,
      subunitIds,
      filters,
      page,
      pageSize,
    } = this.state;

    const unitAndSubunitIds = [...unitIds, ...subunitIds];

    RiskStore.dispatch({
      action: RiskStore.ACTION_FILTER_RISKS,
      data: {
        planRiskId,
        page,
        pageSize,
        filters: {
          ...filters,
          unitIds: unitAndSubunitIds,
        },
      },
      opts: { filtering },
    });
  }

  normalizeApiUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/api/')) return `/forpdi${path}`;
    return `${UnitStore.url}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  fetchAsObjectUrl = async (url) => {
    const res = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/pdf' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const pdfBlob = new Blob([buf], { type: 'application/pdf' });
    return URL.createObjectURL(pdfBlob);
  };

  renderPdfInPreview = (win, objectUrl) => {
    try {
      win.document.open();
      win.document.write(`
      <!doctype html>
      <html lang="pt-br">
        <head>
          <meta charset="utf-8"/>
          <title>Relatório (PDF)</title>
          <style>
            html,body{height:100%;margin:0;}
            .wrap{height:100%;width:100%;display:flex;align-items:stretch;justify-content:center;background:#111;}
            .pdf{flex:1;border:0; width:100%; height:100%;}
            .fallback{color:#fff;font-family:Arial, sans-serif;margin:auto;text-align:center}
            .fallback a{color:#8ec7ff}
          </style>
        </head>
        <body>
          <div class="wrap">
            <embed class="pdf" src="${objectUrl}" type="application/pdf" />
            <noscript>
              <div class="fallback">
                Visualização requer JavaScript. <a href="${objectUrl}" target="_blank" rel="noopener">Abrir PDF</a>
              </div>
            </noscript>
          </div>
        </body>
      </html>
    `);
      win.document.close();
      win.onbeforeunload = () => {
        try { URL.revokeObjectURL(objectUrl); } catch (_) { }
      };
    } catch (_) {
      win.location = objectUrl;
      win.onbeforeunload = () => {
        try { URL.revokeObjectURL(objectUrl); } catch (_) { }
      };
    }
  };

  exportPDF = async () => {
    const {
      unitIds,
      subunitIds,
      filters,
      planRiskId,
    } = this.state;

    if (!unitIds?.length) {
      Toastr.error('Por favor, preencha pelo menos uma unidade antes de gerar o PDF.');
      return;
    }

    const payload = {
      planRiskId,
      title: 'RELATÓRIO DE RISCOS',
      units: unitIds,
      subunits: subunitIds,
      riskFilters: filters,
      selectedYear: -1,
    };

    this.previewWin = window.open('', '_blank');
    if (!this.previewWin) {
      Toastr.error('Não foi possível abrir a janela de visualização (popup bloqueado).');
      return;
    }
    this.renderWaitingInPreview(this.previewWin);

    try {
      const res = await fetch(`${UnitStore.url}/exportUnitReport?async=true`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = (res.headers.get('Content-Type') || '').toLowerCase();
      const isPdf = contentType.includes('application/pdf');

      if (res.ok && isPdf) {
        const buf = await res.arrayBuffer();
        const pdfBlob = new Blob([buf], { type: 'application/pdf' });

        if (!pdfBlob || pdfBlob.size < 1024) {
          Toastr.error('Arquivo PDF inválido ou vazio.');
          this.previewWin?.close();
          return;
        }

        const objectUrl = URL.createObjectURL(pdfBlob);
        this.previewWin.location.replace(objectUrl);
        this.previewWin.onbeforeunload = () => {
          try { URL.revokeObjectURL(objectUrl); } catch (_) { }
        };
        return;
      }

      if (res.status === 202 || contentType.includes('application/json')) {
        const data = await res.json().catch(() => ({}));
        const jobId = data?.jobId;
        if (!jobId) throw new Error('Resposta sem jobId do servidor.');

        const statusUrl = this.normalizeApiUrl(
          data?.statusUrl || `/api/unit/exportUnitReport/status/${jobId}`,
        );

        this.beginReportPolling(statusUrl, jobId, this.previewWin);
        return;
      }

      this.previewWin.close();
      Toastr.error('Erro ao iniciar geração do PDF.');
    } catch (err) {
      console.error(err);
      if (this.previewWin && !this.previewWin.closed) this.previewWin.close();
      Toastr.error('Erro inesperado ao gerar PDF.');
    }
  };

  extractArchiveFromUrl = (url) => {
    if (!url) return null;
    try {
      const u = new URL(this.normalizeApiUrl(url), window.location.origin);
      const m = u.pathname.match(/\/api\/file\/(\d+)(?:\.pdf)?$/i);
      if (m && m[1]) return m[1];
    } catch (_) { }
    return null;
  };

  openArchiveInline = async (archive, targetWin) => {
    const res = await fetch(this.normalizeApiUrl('/api/file'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: String(archive) }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      throw new Error(`Falha ao obter PDF (${res.status}): ${msg || 'sem detalhes'}`);
    }

    const buf = await res.arrayBuffer();
    const pdfBlob = new Blob([buf], { type: 'application/pdf' });

    if (!pdfBlob || pdfBlob.size < 1024) {
      try {
        const previewTxt = new TextDecoder('utf-8').decode(new Uint8Array(buf)).slice(0, 300);
        console.warn('PDF suspeito. Primeiro trecho do corpo:', previewTxt);
      } catch (_) { }
      throw new Error('Arquivo PDF inválido ou vazio.');
    }

    const objectUrl = URL.createObjectURL(pdfBlob);
    const win = targetWin || window;
    win.location.replace(objectUrl);
    win.onbeforeunload = () => {
      try { URL.revokeObjectURL(objectUrl); } catch (_) { }
    };
  };

  beginReportPolling = (statusUrl, jobId, previewWin) => {
    if (this.exportPoll) {
      clearInterval(this.exportPoll);
      this.exportPoll = null;
    }
    const intervalMs = 2000;

    this.exportPoll = setInterval(async () => {
      try {
        if (!previewWin || previewWin.closed) {
          clearInterval(this.exportPoll);
          this.exportPoll = null;
          return;
        }

        const res = await fetch(statusUrl, { method: 'GET', credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const s = await res.json();

        if (s.status === 'SUCCEEDED' || s.status === 'READY' || s.status === 'PRONTO') {
          clearInterval(this.exportPoll);
          this.exportPoll = null;

          let archive = s.file ?? s.archive ?? s.archiveId ?? s.path ?? s.fileId;

          if (!archive && s.downloadUrl) {
            const extracted = this.extractArchiveFromUrl(s.downloadUrl);
            if (extracted) archive = extracted;
          }

          try {
            if (archive) {
              await this.openArchiveInline(archive, previewWin);
            } else if (s.downloadUrl) {
              await this.openArchiveInline(s.downloadUrl, previewWin);
            } else {
              throw new Error('Job finalizado sem referência de arquivo nem URL.');
            }
          } catch (err) {
            console.error('Erro ao abrir PDF:', err);
            previewWin.close();
            Toastr.error('Não foi possível abrir o PDF para visualização.');
          }
          return;
        }

        if (s.status === 'FAILED') {
          clearInterval(this.exportPoll);
          this.exportPoll = null;
          previewWin.close();
          Toastr.error(`Falha ao gerar PDF${s.error ? `: ${s.error}` : ''}`);
          return;
        }

        this.updateWaitingInPreview(previewWin, s);
      } catch (e) {
        console.warn('Polling falhou, tentando novamente...', e);
      }
    }, intervalMs);
  };

  renderWaitingInPreview = (win) => {
    try {
      win.document.open();
      win.document.write(`
      <!doctype html>
      <html lang="pt-br">
        <head>
          <meta charset="utf-8"/>
          <title>Gerando relatório…</title>
          <style>
            :root {
              --accent: #805ad8;           /* Roxo principal */
              --muted: #555;               /* Cinza para textos secundários */
              --ok: #2f855a;               /* Verde para etapas concluídas */
              --bg: #f6f2f3;               /* Fundo claro levemente puxado pro roxo */
            }
            html,body {
              height:100%;
              margin:0;
              background: var(--bg);
              color: #000000ff;                 /* Texto principal preto */
              font-family: Inter, Arial, sans-serif;  position: relative;
              z-index: 1;
            }
            .wrap { max-width:760px; margin:64px auto; padding:0 24px; }
            .title { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
            .spinner {
              width:18px; height:18px;
              border:3px solid rgba(0,0,0,0.15);
              border-top-color: var(--accent);
              border-radius:50%;
              animation:spin 1s linear infinite;
            }
            @keyframes spin { to { transform:rotate(360deg) } }
            .muted { color: var(--muted); margin:0 0 24px; }
            .steps { list-style:none; padding:0; margin:16px 0; display:grid; gap:8px; }
            .step {
              display:flex; align-items:center; gap:12px;
              padding:12px 14px; border-radius:10px;
              background: rgba(128,90,216,0.06);
              border:1px solid rgba(0,0,0,0.08);
            }
            .step .dot { width:10px; height:10px; border-radius:50%; background: rgba(0,0,0,0.25); }
            .step.current { border-color: var(--accent); background: rgba(128,90,216,0.15); }
            .step.current .dot { background: var(--accent); }
            .step.done { border-color: var(--ok); background: rgba(47,133,90,0.12); }
            .step.done .dot { background: var(--ok); }
            .label { font-weight:600; }
            .hint { color: var(--muted); font-size:12px; }
            .progress {
              height:10px; background: rgba(0,0,0,0.08);
              border-radius:999px; overflow:hidden; margin-top:18px;
              border:1px solid rgba(0,0,0,0.1);
            }
            .bar {
              height:100%; width:0%;
              background: linear-gradient(90deg, var(--accent), #9f7aea);
            }
            .sr { position:absolute; left:-9999px; }
          </style>
        </head>
        <body>
        <div>
              <img 
              src="${forriscoLogo}" 
              alt="Logo Forrisco" 
              style="display: block; height: 45px; margin-top: 20px; margin-left: 40px; margin-bottom: -60px;"
            />
        </div>
        <img
          src="${Imagem}"
          alt="Detalhe"
          style="position: absolute; right: 80px; top: 80%; transform: translateY(-50%); height: 220px;"
        />

          <div class="wrap">
            <div class="title">
              <div class="spinner" aria-hidden="true"></div>
              <h2>Gerando PDF…</h2>
            </div>
            <p class="muted">Acompanhe as etapas abaixo. A visualização abrirá automaticamente quando terminar.</p>

            <ol class="steps" id="steps">
              <li class="step current" id="step-ENFILEIRADO">
                <span class="dot"></span>
                <div>
                  <div class="label">Processando</div>
                  <div class="hint">Aguardando início do processamento</div>
                </div>
              </li>
              <li class="step" id="step-GERANDO">
                <span class="dot"></span>
                <div>
                  <div class="label">Gerando conteúdo</div>
                  <div class="hint">Montando dados e páginas do relatório</div>
                </div>
              </li>
              <li class="step" id="step-ESCREVENDO">
                <span class="dot"></span>
                <div>
                  <div class="label">Escrevendo arquivo</div>
                  <div class="hint">Gravando PDF temporário</div>
                </div>
              </li>
              <li class="step" id="step-REGISTRANDO">
                <span class="dot"></span>
                <div>
                  <div class="label">Registrando</div>
                  <div class="hint">Criando referência do arquivo</div>
                </div>
              </li>
              <li class="step" id="step-ENVIANDO">
                <span class="dot"></span>
                <div>
                  <div class="label">Enviando</div>
                  <div class="hint">Publicando no armazenamento</div>
                </div>
              </li>
              <li class="step" id="step-PRONTO">
                <span class="dot"></span>
                <div>
                  <div class="label">Pronto</div>
                  <div class="hint">Abrindo a visualização</div>
                </div>
              </li>
            </ol>

            <div class="progress" aria-hidden="true"><div id="bar" class="bar"></div></div>
            <span id="sr-progress" class="sr" role="status" aria-live="polite">0%</span>
            <div id="status" class="muted" style="margin-top:8px;"></div>
          </div>
        </body>
      </html>
    `);
      win.document.close();
    } catch (_) { }
  };


  updateWaitingInPreview = (win, statusObj) => {
    try {
      const ALL_STEPS = ['ENFILEIRADO', 'GERANDO', 'ESCREVENDO', 'REGISTRANDO', 'ENVIANDO', 'PRONTO'];

      const normalizeStage = (rawStage, rawProgress, rawStatus) => {
        const s = (rawStage || '').toString().trim().toUpperCase();

        const aliases = {
          PENDING: 'ENFILEIRADO',
          RUNNING: 'GERANDO',
          GENERATE: 'GERANDO',
          GENERATING: 'GERANDO',
          CREATING: 'ESCREVENDO',
          WRITE: 'ESCREVENDO',
          WRITING: 'ESCREVENDO',
          SAVE: 'ESCREVENDO',
          STORE: 'REGISTRANDO',
          ARCHIVING: 'REGISTRANDO',
          UPLOAD: 'ENVIANDO',
          UPLOADING: 'ENVIANDO',
          DONE: 'PRONTO',
          SUCCEEDED: 'PRONTO',
          SUCCESS: 'PRONTO',
          READY: 'PRONTO',
        };

        const aliased = aliases[s] || s;
        if (ALL_STEPS.includes(aliased)) return aliased;

        const st = (rawStatus || '').toString().toUpperCase();
        if (st === 'FAILED') return 'GERANDO';
        if (st === 'SUCCEEDED') return 'PRONTO';

        const p = Math.max(0, Math.min(100, Number(rawProgress ?? 0)));
        if (p >= 95) return 'PRONTO';
        if (p >= 75) return 'ENVIANDO';
        if (p >= 55) return 'REGISTRANDO';
        if (p >= 35) return 'ESCREVENDO';
        if (p >= 10) return 'GERANDO';
        return 'ENFILEIRADO';
      };

      const progress = Math.max(0, Math.min(100, Number(statusObj?.progress ?? 0)));
      const stage = normalizeStage(statusObj?.stage, progress, statusObj?.status);

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

      const sr = win.document.getElementById('sr-progress');
      if (sr) sr.textContent = `${progress}%`;

      const st = win.document.getElementById('status');
      if (st) {
        if (statusObj?.error) {
          st.textContent = `Erro: ${statusObj.error}`;
        } else {
          st.textContent = `Etapa atual: ${stage} (${progress}%)`;
        }
      }
    } catch (_) { /* ignora */ }
  };

  exportCSV = async () => {
    const {
      planRiskId, unitIds, subunitIds, filters,
    } = this.state;

    const body = JSON.stringify({
      planRiskId,
      filters: JSON.stringify({ ...filters, unitIds: [...unitIds, ...subunitIds] }),
    });

    const res = await fetch('/forpdi/risk/exportCSV', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const blob = await res.blob();
    window.open(URL.createObjectURL(blob));
  }

  exportIncidentsCSV = async () => {
    const {
      planRiskId, unitIds, subunitIds, filters,
    } = this.state;

    if (!planRiskId) {
      Toastr && Toastr.error('Selecione um Plano de Gestão.');
      return;
    }

    const allUnitIds = [].concat(unitIds || [], subunitIds || []);
    if (!allUnitIds.length) {
      Toastr && Toastr.error('Selecione ao menos uma unidade ou subunidade.');
      return;
    }

    const rawType = filters && filters.type;
    let typeId = null;
    if (rawType !== undefined && rawType !== null && String(rawType).trim() !== '') {
      const parsed = parseInt(String(rawType), 10);
      if (!Number.isNaN(parsed)) typeId = parsed;
    }

    const payload = {
      planRiskId,
      unitIds: allUnitIds,
      incident: (filters && filters.incident) || null,
      type: typeId,
      startCreation: (filters && filters.startCreation) || null,
      endCreation: (filters && filters.endCreation) || null,
    };

    try {
      const res = await fetch('/forpdi/incident/exportCSV', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${txt ? ` - ${txt}` : ''}`);
      }

      const blob = await res.blob();
      if (!blob || blob.size === 0) {
        Toastr && Toastr.error('CSV vazio ou inválido.');
        return;
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incidentes-${planRiskId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error(err);
      Toastr && Toastr.error('Falha ao exportar CSV de incidentes.');
    }
  };


  renderExtractConfirmationInfo() {
    return (
      <SystemInfo>Confirme os resultados para a extração.</SystemInfo>
    );
  }

  renderContent() {
    const { loading, risks } = this.state;

    return (
      <div>
        <RiskReportFilter onFilter={this.onFilter} />
        {this.renderExtractConfirmationInfo()}
        <div id="scroll-reference" />
        <RiskReportTable
          risks={risks}
          loading={loading}
          stickyTopHead={TabbedPanel.tabsHeight + topContainerHeight}
        />

      </div>
    );
  }

  render() {
    const {
      total,
      page,
      pageSize,
      planRiskId,
      unitIds,
      subunitIds,
      loading,
    } = this.state;

    const { location: routeLocation = {}, children } = this.props;
    const { pathname: routePathname = '' } = routeLocation;

    const win = (typeof window !== 'undefined') ? window : { location: { pathname: '' } };
    const { location: winLocation = { pathname: '' } } = win;
    const { pathname: winPathname = '' } = winLocation;

    const pathname = routePathname || winPathname;

    const isIncidents = /\/forrisco\/reports\/incident\b/.test(pathname);

    const hasPlanRiskSelected = !!planRiskId;
    const hasUnitsSelected = (unitIds.length + subunitIds.length) > 0;

    const canExportRisks = hasPlanRiskSelected;
    const canExportIncidents = hasPlanRiskSelected && hasUnitsSelected && !loading;

    const tabs = [
      { label: Messages.get('label.risks'), to: '/forrisco/reports/risk' },
      { label: Messages.get('label.incidents'), to: '/forrisco/reports/incident' },
    ];

    const riskContent = (
      <TabbedPanel.MainContainer>
        {this.renderContent()}
        <Pagination
          total={total}
          onChange={this.pageChange}
          page={page}
          pageSize={pageSize}
        />
      </TabbedPanel.MainContainer>
    );

    const tabContent = React.isValidElement(children) ? children : riskContent;

    return (
      <AppContainer.Content>
        <AppContainer.TopContent>
          <MainTitle label={Messages.get('label.reports')} />
          <div>
            {isIncidents ? (
              <PrimaryButton
                title={Messages.get('label.exportCSV')}
                text={Messages.get('label.exportCSV')}
                onClick={this.exportIncidentsCSV}
                disabled={!canExportIncidents}
              />
            ) : (
              <div>
                <PrimaryButton
                  title={Messages.get('label.exportCSV')}
                  text={Messages.get('label.exportCSV')}
                  onClick={this.exportCSV}
                  disabled={!canExportRisks}
                  style={{ marginRight: '1rem' }}
                />
                <PrimaryButton
                  title={Messages.get('label.exportPDF')}
                  text={Messages.get('label.exportPDF')}
                  onClick={this.exportPDF}
                  disabled={!canExportRisks}
                />
              </div>
            )}
          </div>
        </AppContainer.TopContent>

        <AppContainer.MainContent>
          <TabbedPanel
            tabs={tabs}
            topContainerContent={{ height: topContainerHeight }}
          >
            {tabContent}
          </TabbedPanel>
        </AppContainer.MainContent>
      </AppContainer.Content>
    );
  }
}

RiskReportMainPage.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }),
  children: PropTypes.node,
};

RiskReportMainPage.defaultProps = {
  location: { pathname: '' },
  children: null,
};

export default RiskReportMainPage;
