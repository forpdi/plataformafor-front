import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import Messages from 'forpdi/src/Messages';

const Pagination = (
  {
    pageSize, onChange, total, page, options,
  },
  { theme },
) => {
  function getArrayPages(lastPage, currentPage) {
    let visiblePages;
    if (lastPage <= 5) {
      visiblePages = [];
      for (let i = 1; i <= lastPage; i += 1) {
        visiblePages.push(i);
      }
    } else if (currentPage <= 3) {
      visiblePages = [1, 2, 3, null, lastPage];
    } else if (currentPage >= lastPage - 2) {
      visiblePages = [1, null, lastPage - 2, lastPage - 1, lastPage];
    } else {
      visiblePages = [1, null, currentPage, null, lastPage];
    }
    return visiblePages;
  }

  const visiblePage = page != null ? page : 1;
  const currentPage = total ? visiblePage : 0;
  const lastPage = Math.ceil(total / pageSize);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === lastPage;
  const visiblePages = getArrayPages(lastPage, currentPage);

  function renderPageSizeSelect() {
    return (
      <span className="page-number">
        {`Página ${currentPage} de ${lastPage}`}
        {
          options && (
            <span className="marginLeft20">{`${Messages.get('label.show')} `}</span>
          )
        }
        {
          options && (
            <select
              title={Messages.get('label.resultsPerPage')}
              onChange={e => onChange(1, parseInt(e.target.value, 10))}
              className="page-size-dropdown"
              value={pageSize}
            >
              {options.map(option => (
                <option
                  key={`${option.value}-${option.label}`}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          )
        }
      </span>
    );
  }

  function renderButtonPrevious() {
    return renderButtonPrevOrNext(
      Messages.get('label.previous'),
      isFirstPage || !total,
      currentPage - 1,
    );
  }

  function renderButtonPage(current, newPage, idx) {
    if (!newPage) {
      return <li key={idx}>...</li>;
    }

    const isCurrent = current === newPage;

    return (
      <li className={isCurrent ? `${theme}-active` : ''} key={idx}>
        <button
          type="button"
          className={`page-nr ${theme}-primary-color ${isCurrent ? `${theme}-active-1` : ''}`}
          style={{
            borderRadius: '20px',
            marginInline: '5px',
            border: 'none',
          }}
          onClick={() => (isCurrent ? null : onChange(newPage, pageSize))}
        >
          {newPage}
        </button>
      </li>
    );
  }

  function renderButtonNext() {
    return renderButtonPrevOrNext(
      Messages.get('label.next'),
      isLastPage,
      currentPage + 1,
    );
  }

  function renderButtonPrevOrNext(title, disabled, targetPage) {
    return (
      <li>
        <button
          title={title}
          type="button"
          className={disabled
            ? `page-disabled page-nr ${theme}-primary-color`
            : `page-nr ${theme}-primary-color`
          }
          style={{
            border: '1px solid',
            borderRadius: '5px',
            background: 'transparent',
          }}
          onClick={() => onChange(targetPage, pageSize)}
        >
          <span aria-hidden="true">
            {title}
          </span>
        </button>
      </li>
    );
  }

  return (
    <div className="pagination-ctn">
      {renderPageSizeSelect()}
      <nav aria-label="Page navigation" className="floatRight">
        <ul className="pagination">
          {renderButtonPrevious()}
          {_.map(visiblePages, (newPage, idx) => renderButtonPage(currentPage, newPage, idx))}
          {renderButtonNext()}
        </ul>
      </nav>
    </div>
  );
};

Pagination.propTypes = {
  total: PropTypes.number,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({})),
};

Pagination.defaultProps = {
  total: 0,
  page: 1,
  pageSize: Pagination.defaultPageSize,
  options: [
    { value: 50, label: Messages.get('label.fiftyItems') },
    { value: 100, label: Messages.get('label.oneHundredItems') },
    { value: 120, label: Messages.get('label.oneHundredTwentyItems') },
  ],
};

Pagination.contextTypes = {
  theme: PropTypes.string,
};

Pagination.defaultPageSize = 50;

export default Pagination;
