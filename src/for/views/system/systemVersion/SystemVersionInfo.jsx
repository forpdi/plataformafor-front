import React from 'react';

import Text from 'forpdi/src/components/typography/Text';
import AppContainer from 'forpdi/src/components/AppContainer';
import TabbedPanel from 'forpdi/src/components/TabbedPanel';
import PageHeader from 'forpdi/src/components/PageHeader';
import SystemInfo from 'forpdi/src/components/SystemInfo';

const versionHistoryContribution = 'Contribuição para Melhorias na Plataforma';

class SystemVersionInfo extends React.Component {
  renderInfoText() {
    return (
      <SystemInfo style={{ marginBottom: '1.5rem' }} iconAlign="flex-start">
        <Text>
          <b> Olá! </b>
          Quando você se depara com erros ou com possíveis sugestões de evoluções
          na Plataforma, você abre chamados ao nosso time de suporte, certo?
        </Text>
        <Text style={{ marginTop: '0.5rem' }}>
          Então, queremos te apoiar na abertura e descrição desses chamados.
        </Text>
        <Text style={{ marginTop: '0.5rem' }}>
          Isso irá otimizar o nosso tempo de atendimento e entendimento com clareza
          da sua necessidade, veja abaixo algumas dicas.
        </Text>
      </SystemInfo>
    );
  }

  renderTopContent = () => (
    <AppContainer.TopContent>
      <PageHeader pageTitle={versionHistoryContribution} to="/system/version" />
    </AppContainer.TopContent>
  );

  renderMainContent = () => (
    <AppContainer.MainContent>
      <AppContainer.Section>
        {this.renderInfoText()}
      </AppContainer.Section>
      <TabbedPanel tabs={[{ label: 'Contribuição para Melhorias' }]}>
        <TabbedPanel.MainContainer>
          <div>
            <b style={{ fontSize: '20px', marginBottom: '100px' }}>Instruções para Abertura de Chamados Relacionados a Erros</b>
            <p>Antes das dicas, ressaltamos que erros na Plataforma são aspectos ou funcionalidades que já foram implementados e, por alguma razão, não estão mais funcionando, seja de forma parcial ou total.</p>
            <ol>
              <li>
                <b>Descreva o Problema!</b>
                <ul style={{ listStyleType: 'lower-alpha' }}>
                  <li>Detalhe o máximo possível o erro encontrado. Se possível, descreva como era o comportamento esperado e como está no momento do erro.</li>
                  <li>Detalhe também a data e hora em que ele ocorreu, o que é bastante útil para pesquisar e avaliar nossos registros;</li>
                  <li>Descreva o seu passo a passo dentro do sistema até se deparar com o erro. É importante entendermos o caminho executado no sistema para simularmos o caminho percorrido;</li>
                  <li>Informe se o problema é constante ou intermitente;</li>
                </ul>
              </li>
              <br />
              <li>
                <b>Ilustre o problema!</b>
                <ul style={{ listStyleType: 'lower-alpha' }}>
                  <li>Se conseguir, nos envie capturas de tela legíveis com o URL completo e a mensagem de erro, por prints ou vídeos, com a ocorrência do erro. Elas nos ajudam bastante a visualizar o que pode ser o erro sinalizado.</li>
                  <li>Caso seja utilizado algum arquivo durante o seu passo a passo dentro do sistema até se deparar com o erro, nos encaminhe em anexo ao ticket.</li>
                </ul>
              </li>
              <br />
            </ol>

            <b style={{ fontSize: '20px' }}>Instruções para Abertura de Chamados para Melhorias e Evoluções</b>
            <br />
            <p>Melhorias e evoluções são aspectos ou funcionalidades que ainda não existem na Plataforma, mas que poderiam, após análise interna, contribuir positivamente para a experiência do usuário e/ou gestão dos indicadores e riscos.</p>
            <ol>
              <li>
                Em qual dos módulos você gostaria de propor evoluções? Nos sinalize se seria na Plataforma como um todo, no FORPDI ou FORRISCO;
              </li>
              <li>
                Caso seja evolução e/ou melhoria em uma funcionalidade já existente, indique o caminho da funcionalidade. Capturas de tela legíveis com o URL completo nos ajudam a entender onde se localizaria sua proposta;
              </li>
              <li>
                Apresente a descrição da evolução, contendo possíveis campos, regras de execução, demais detalhes que possam nos apoiar no entendimento, bem como suas expectativas e/ou benefícios uma vez implementada a solicitação.
              </li>
            </ol>
            <div style={{
              backgroundColor: '#f8f9fa', padding: '10px', marginTop: '20px', border: '1px solid #e0e0e0', borderRadius: '5px',
            }}
            >
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Nota Importante:</p>
              <p>Mesmo seguindo estas dicas, podem ser necessários alinhamentos adicionais sobre sua demanda. Fique atento aos canais de comunicação informados em seu cadastro.</p>
            </div>

            <div style={{
              marginTop: '20px', padding: '10px', textAlign: 'center', backgroundColor: '#e6f4ea', border: '1px solid #b3d8b3', borderRadius: '5px',
            }}
            >
              <p style={{ fontWeight: 'bold', fontSize: '18px', color: '#1C3F1D' }}>Agradecemos pela sua contribuição na Plataforma!</p>
            </div>
          </div>
        </TabbedPanel.MainContainer>
      </TabbedPanel>
    </AppContainer.MainContent>
  )

  render() {
    return (
      <AppContainer.Content>
        {this.renderTopContent()}
        <AppContainer.ScrollableContent>
          {this.renderMainContent()}
        </AppContainer.ScrollableContent>
      </AppContainer.Content>
    );
  }
}

export default SystemVersionInfo;
