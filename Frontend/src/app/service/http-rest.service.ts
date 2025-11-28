import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take, throwError } from 'rxjs';
import { TipoRequisicaoRestEnum } from '../../enum/tipo-requisicao-enum';

const headers = new HttpHeaders()
  .set('Content-Type', 'application/json; charset-UTF-8')
  .set('Access-Control-Allow-Origin', '*')
  .set('Cache-Control', 'no-cache')
  .set('Pragma', 'no-cache')
  .set('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT');


@Injectable({
  providedIn: 'root'
})
export class HttpRestService {

  private API = 'http://localhost';

  constructor(
    private http: HttpClient,
  ) { }

  /**
 * Gera uma solicitação de consulta de acordo com o tipo da requisição.
 *
 * @param tipoRequisicao
 * @param path
 * @param params
 * @param body
 * @param url
 */
  gerarSolicitacao(
    tipoRequisicao: TipoRequisicaoRestEnum,
    path: string,
    params?: HttpParams,
    body?: any,
    url?: string,
    options?: any
  ) {
    const headers = this.geraHeader();

    return this.montaRequest(
      tipoRequisicao,
      path,
      params,
      body,
      url,
      headers,
      options
    );
  }


  private geraHeader() {
    const headers = {
      'Content-Type': 'application/json; charset-UTF-8',
    };
    return headers;
  }

  private montaRequest(
    tipoRequisicao: TipoRequisicaoRestEnum,
    path: string,
    params?: HttpParams,
    body?: any,
    url?: string,
    headers?: any,
    options?: any
  ) {
    let solicitacao$: Observable<any>;

    switch (tipoRequisicao) {
      case TipoRequisicaoRestEnum.GET: {
        solicitacao$ = this.get(path, params, url, headers, options);
        break;
      }
      default: {
        solicitacao$ = throwError(
          'Somente é permitido um dos seguintes tipos de requisição: GET, POST, PUT ou DELETE'
        );
        break;
      }
    }

    return solicitacao$;
  }


  /**
 * Requisição GET.
 *
 * @param path
 * @param params
 * @param url
 */
  private get(
    path: string,
    params?: HttpParams,
    url?: string,
    headers?: any,
    options?: any
  ) {
    return this.http.get(url ? url : this.API + path, {
      headers,
      params,
      ...options
    }).pipe(take(1));
  }
}
