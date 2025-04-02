import React from 'react';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import _ from 'underscore';

import DashboardCard from 'forpdi/src/components/dashboard/DashboardCard';
import ForPDIChart from 'forpdi/src/forpdi/core/widget/ForPDIChart';
import ExportReportButtons from 'forpdi/src/for/components/ExportReportButtons';

import CompanyType from 'forpdi/src/forpdi/planning/enum/CompanyType';
import { parseDateTime, splitDateTime, getMonthYearFormatted } from 'forpdi/src/utils/dateUtil';
import Region from 'forpdi/src/forpdi/planning/enum/Region';

import RegioesMapa from 'forpdi/img/regions/regioes.png';
import SulMapa from 'forpdi/img/regions/sul.png';
import NordesteMapa from 'forpdi/img/regions/nordeste.png';
import CentroOesteMapa from 'forpdi/img/regions/centro-oeste.png';
import NorteMapa from 'forpdi/img/regions/norte.png';
import SudesteMapa from 'forpdi/img/regions/sudeste.png';

const mapsDict = {
  '-1': {
    image: RegioesMapa,
    dataPositions: {
      1: [179, 120], 2: [430, 195], 3: [385, 345], 4: [290, 460], 5: [270, 285],
    },
  },
  1: { image: NorteMapa, dataPositions: [275, 275] },
  2: { image: NordesteMapa, dataPositions: [255, 245] },
  3: { image: SudesteMapa, dataPositions: [295, 275] },
  4: { image: SulMapa, dataPositions: [285, 240] },
  5: { image: CentroOesteMapa, dataPositions: [235, 270] },
};

const AdhesionsCard = ({
  onExportPdf,
  onExportCsv,
  selectedCompanies,
  regionCounts,
  totalCompanies,
}) => {
  function hasOnlyOneSelectedCompany() {
    return selectedCompanies.length === 1;
  }

  function getAdhesionChartData() {
    const dates = _.sortBy(_.map(selectedCompanies, ({ creation }) => parseDateTime(creation)));
    const firstDate = dates[0];
    const data = [{ yearMonth: new Date(firstDate.getFullYear(), firstDate.getMonth()), count: 1 }];
    for (let i = 1; i < dates.length; i += 1) {
      const date = dates[i];
      const lastDataItem = data[data.length - 1];
      const { yearMonth: lastYearMonth } = lastDataItem;

      if (date.getFullYear() !== lastYearMonth.getFullYear() || date.getMonth() !== lastYearMonth.getMonth()) {
        data.push({ yearMonth: new Date(date.getFullYear(), date.getMonth()), count: 1 });
      } else {
        lastDataItem.count += 1;
      }
    }

    return [
      ['Mês/ano', 'Adesões', { type: 'string', role: 'tooltip' }],
      ..._.map(data, ({ yearMonth, count }) => [yearMonth, count, `${getMonthYearFormatted(yearMonth)}\nADESÕES: ${count}`])];
  }

  function renderMapImage() {
    const selectedRegionId = regionCounts.length === 1 ? regionCounts[0].regionId : '-1';
    const { image, dataPositions } = mapsDict[`${selectedRegionId}`];

    return (
      <div style={{ position: 'relative' }}>
        {
          _.map(regionCounts, ({ universityCount, instituteCount, regionId }) => {
            if (!totalCompanies) {
              return null;
            }
            const positions = _.isArray(dataPositions)
              ? dataPositions
              : dataPositions[`${regionId}`];
            const percent = (instituteCount + universityCount) / totalCompanies;
            return (
              <b
                style={{
                  position: 'absolute',
                  fontSize: '18px',
                  background: 'white',
                  padding: '0 4px',
                  borderRadius: '7px',
                  left: positions[0],
                  top: positions[1],
                }}
                key={regionId}
              >
                { `${Math.round(percent * 100)}%` }
              </b>
            );
          })
        }
        <img src={image} alt="Mapa" style={{ width: '550px' }} />
      </div>
    );
  }

  function rederCompanyDetails() {
    if (hasOnlyOneSelectedCompany()) {
      const selectedCompany = selectedCompanies[0];
      const { date: creationDate } = splitDateTime(selectedCompany.creation);
      return (
        <div style={{ margin: '30px 70px' }}>
          <h4>Detalhes da Instituição:</h4>
          <p>
            Nome:
            {' '}
            {selectedCompany.name}
          </p>
          <p>
            Sigla:
            {' '}
            {selectedCompany.initials}
          </p>
          <p>
            Descrição:
            {' '}
            {selectedCompany.description}
          </p>
          <p>
            Tipo:
            {' '}
            {CompanyType[selectedCompany.type].name}
          </p>
          <p>
            Data de adesão:
            {' '}
            {creationDate}
          </p>
        </div>
      );
    }
    return null;
  }

  function renderMapLegends() {
    return regionCounts.map(region => (
      <p key={region.regionName} style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{
          display: 'inline-block',
          width: '15px',
          height: '15px',
          backgroundColor: Region[region.regionId].color,
          borderRadius: '50%',
          marginRight: '10px',
        }}
        />
        <span>
          {region.regionName}
          :
          {' '}
          {region.universityCount}
          {' '}
          Universidades /
          {' '}
          {region.instituteCount}
          {' '}
          Institutos Federais
        </span>
      </p>
    ));
  }

  function renderPieChart() {
    let totalUniversities = 0;
    let totalInstitutes = 0;
    let totalOthers = 0;

    _.forEach(selectedCompanies, ({ type }) => {
      if (type === CompanyType.university.id) {
        totalUniversities += 1;
      } else if (type === CompanyType.institute.id) {
        totalInstitutes += 1;
      } else if (type === CompanyType.others.id) {
        totalOthers += 1;
      } else {
        throw Error(`Invalid company type ${type}`);
      }
    });

    const pieData = [
      ['Instituição', 'Quantidade'],
      ['Universidades', totalUniversities],
      ['Institutos Federais', totalInstitutes],
      ['Outros', totalOthers],
    ];

    return (
      <div style={{ display: hasOnlyOneSelectedCompany() ? 'none' : 'block' }}>
        <Chart
          graph_id="adhesions-pie-chart"
          chartType="PieChart"
          data={pieData}
          options={{
            pieHole: 0.4,
            is3D: false,
          }}
          width="100%"
          height="380px"
        />
      </div>
    );
  }

  function renderLineChart() {
    return (
      <div style={{ display: hasOnlyOneSelectedCompany() ? 'none' : 'block' }}>
        <ForPDIChart
          graph_id="adhesion-chart"
          chartType="LineChart"
          data={getAdhesionChartData()}
          options={{
            hAxis: {
              title: 'Mês/Ano',
              format: 'MM/YYYY',
            },
            vAxis: {
              title: 'Adesões',
              format: '0',
              viewWindow: {
                min: 0,
              },
            },
            title: 'Adesão',
            legend: { position: 'bottom' },
            pointsVisible: true,
            pointSize: 7,
          }}
          width="100%"
          height="330px"
          legend_toggle={false}
        />
      </div>
    );
  }

  return (
    <DashboardCard
      title="Adesões"
      height="800px"
    >
      <ExportReportButtons
        onExportPdf={onExportPdf}
        onExportCsv={onExportCsv}
      />
      <div className="row">
        <div className="col col-sm-6">
          <div style={{
            height: '740px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
          >
            {renderMapImage()}
            <div style={{ marginTop: '20px', alignSelf: 'flex-start' }}>
              {renderMapLegends()}
            </div>
          </div>
        </div>
        <div className="col col-sm-6">
          {rederCompanyDetails()}
          {renderPieChart()}
          {renderLineChart()}
        </div>
      </div>
    </DashboardCard>
  );
};

AdhesionsCard.propTypes = {
  selectedCompanies: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      initials: PropTypes.string,
      description: PropTypes.string,
      county: PropTypes.shape({
        uf: PropTypes.shape({
          region: PropTypes.shape({ name: PropTypes.string }),
        }),
      }),
    }),
  ).isRequired,
  regionCounts: PropTypes.arrayOf(
    PropTypes.shape({
      regionId: PropTypes.number,
      regionName: PropTypes.string,
      universityCount: PropTypes.number,
      instituteCount: PropTypes.number,
      color: PropTypes.string,
    }),
  ).isRequired,
  totalCompanies: PropTypes.number.isRequired,
  onExportPdf: PropTypes.func.isRequired,
  onExportCsv: PropTypes.func.isRequired,
};

AdhesionsCard.defaultProps = {
};

export default AdhesionsCard;
