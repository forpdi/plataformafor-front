import _ from 'underscore';
import React from "react";
import $ from 'jquery';

import Messages from "forpdi/src/Messages.jsx";
import { MIN_PAGE_SIZE } from "forpdi/src/consts.js"

export default React.createClass({
    getDefaultProps() {
        return {
            total: 0,
            onChangePage: _.noop,
            defaultPageSize: MIN_PAGE_SIZE,
            theme: 'fpdi',
        };
    },
    getInitialState() {
        return {
            page: this.props.page || 1,
            pageSize: this.props.pageSize || this.props.defaultPageSize,
            pages: 0,
        };
    },

    loadPage(page, size) {
        const { onChangePage } = this.props;
        size = (isNaN(size) ? this.state.pageSize : size);
        page = (page > Math.ceil(this.props.total / size) ? Math.ceil(this.props.total / size) : page);
        onChangePage && onChangePage(page, size);
        this.state.page = page;
    },

    componentDidMount(){
        this.setState({
            pages: Math.ceil(this.props.total / this.state.pageSize),
        });
    },

    componentWillReceiveProps(newProps){
        this.setState({
            pages: Math.ceil(newProps.total/this.state.pageSize),
            page: (this.props.page != undefined ? this.props.page : (this.state.page > Math.ceil(newProps.total/this.state.pageSize) ? 1 : this.state.page))
        });
    },

    changePageSize(){
        this.setState({
            pageSize: $("#"+this.props.tableName).val(),
            pages: Math.ceil(this.props.total/$("#"+this.props.tableName).val())
        });
        this.loadPage(this.state.page, $("#"+this.props.tableName).val());
    },

    renderPages(){
        var max = Math.ceil(this.props.total/this.state.pageSize);
        var pages = [];
        const { theme } = this.props
        if(max <= 5){
            for (var i = 1; i <= max; i++) {
                pages.push(
                    <li key={"page-"+i} className={i == this.state.page ? "active" : ""}>
                        <a onClick={this.loadPage.bind(this,i)} className={`page-nr ${theme}-primary-color`}>
                            {i}
                        </a>
                    </li>
                );
            }
            return pages;
        }

        var cont = 3, contN = 3;
        pages.push(this.state.page);
        pages.push(this.state.page-1 <= 0 ? this.state.page+(cont++): this.state.page-1);
        pages.push(this.state.page-2 <= 0 ? this.state.page+(cont): this.state.page-2);
        pages.push(this.state.page+1 > max ? this.state.page-(contN++): this.state.page+1);
        pages.push(this.state.page+2 > max ? this.state.page-(contN): this.state.page+2);
        pages.push(1);
        pages.push(2);
        pages.push(max);
        pages.push(max-1);

        var newPages = [];
        _.each(pages, (n) => {
            if(!_.contains(newPages, n)){
                newPages.push(n);
            }
        });
        newPages.sort(function(a, b){return a-b});
        pages = [];
        newPages.forEach((i, idx) => {
            if(idx > 0 && newPages[idx]-newPages[idx-1] > 1){
                pages.push(
                    <li key={"pagex-"+i}>
                        <a className={`page-disabled page-nr ${theme}-primary-color`}>
                            ...
                        </a>
                    </li>
                );
            }
            pages.push(
                <li key={"page-"+i} className={i == this.state.page ? "active" : ""}>
                    <a onClick={this.loadPage.bind(this,i)} className={`page-nr ${theme}-primary-color`}>
                        {i}
                    </a>
                </li>
            );
        });
        
        return pages;
    },

    render(){
        if(this.props.total > 0){
            const { theme } = this.props
            return(
                <div className="pagination-ctn">
                    <style>{`
                        /* Estilo padrão para os botões (Anterior, Números, Próximo) */
                        .pagination > li > a,
                        .pagination > li > span {
                            position: relative;
                            float: left;
                            padding: 6px 12px;
                            margin-left: -1px;
                            line-height: 1.42857143;
                            text-decoration: none;
                            background-color: #fff;
                            border: 1px solid #ddd; /* Borda Cinza */
                            color: #337ab7;         /* Texto Azul */
                        }

                        /* Arredondar canto esquerdo do primeiro botão */
                        .pagination > li:first-child > a, 
                        .pagination > li:first-child > span {
                            margin-left: 0;
                            border-top-left-radius: 4px;
                            border-bottom-left-radius: 4px;
                        }

                        /* Arredondar canto direito do último botão */
                        .pagination > li:last-child > a, 
                        .pagination > li:last-child > span {
                            border-top-right-radius: 4px;
                            border-bottom-right-radius: 4px;
                        }

                        /* Estilo quando o mouse passa por cima (Hover) */
                        .pagination > li > a:hover,
                        .pagination > li > span:hover,
                        .pagination > li > a:focus,
                        .pagination > li > span:focus {
                            z-index: 2;
                            color: #23527c;
                            background-color: #eee;
                            border-color: #ddd;
                        }

                        /* Estilo do botão ATIVO (Fundo Azul) */
                        .pagination > .active > a, 
                        .pagination > .active > a:focus, 
                        .pagination > .active > a:hover, 
                        .pagination > .active > span, 
                        .pagination > .active > span:focus, 
                        .pagination > .active > span:hover {
                            z-index: 3;
                            color: #fff !important; /* Texto branco */
                            cursor: default;
                            background-color: #337ab7;
                            border-color: #337ab7;
                        }

                        /* Estilo para botões desabilitados */
                        .pagination > .disabled > a,
                        .pagination > .disabled > a:focus,
                        .pagination > .disabled > a:hover,
                        .pagination > .disabled > span,
                        .pagination > .disabled > span:focus,
                        .pagination > .disabled > span:hover {
                            color: #777;
                            cursor: not-allowed;
                            background-color: #fff;
                            border-color: #ddd;
                        }
                    `}</style>

                    <span className="page-number">
                        {"Página "+this.state.page+" de "+this.state.pages}
                        <span className="marginLeft20">{ Messages.get ("label.show") + " "}</span>
                        <select onChange={this.changePageSize} id={this.props.tableName} className="page-size-dropdown" value={this.state.pageSize}>
                            <option value="5">{Messages.get("label.fiveItems")}</option>
                            <option value="10">{Messages.get("label.tenItems")}</option>
                            <option value="15">{Messages.get("label.fifteenItems")}</option>
                            <option value="20">{Messages.get("label.twentyItems")}</option>
                            <option value="25">{Messages.get("label.twentyFiveItems")}</option>
                            <option value="50">{Messages.get("label.fiftyItems")}</option>
                        </select>
                    </span>
                    <nav aria-label="Page navigation" className="floatRight">
                        <ul className={"pagination pagination-" + this.props.theme}>
                        <li>
                          <a aria-label="Previous" className={this.state.page <= 1 ? `page-disabled page-nr ${theme}-primary-color` : `page-nr ${theme}-primary-color`}
                          onClick={this.state.page > 1 ? this.loadPage.bind(this,Number(this.state.page)-1) : _.noop}>
                            <span aria-hidden="true">{Messages.get("label.previous")}</span>
                          </a>
                        </li>
                        {this.renderPages()}
                        <li>
                          <a aria-label="Next" className={this.state.page >= this.state.pages ? `page-disabled page-nr ${theme}-primary-color` : `page-nr ${theme}-primary-color`}
                           onClick={this.state.page < this.state.pages ? this.loadPage.bind(this,Number(this.state.page)+1) : _.noop}>
                            <span aria-hidden="true">{Messages.get("label.next")}</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                </div>
            );
        } else {
            return <div/>
        }
    }
});