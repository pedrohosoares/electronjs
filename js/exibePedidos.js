const divImpressoes = document.querySelector('#impressoes')
const windowPrint = require('electron').remote.BrowserWindow;
const btnstartImpression = document.querySelector('#startImpression');

let imprimindo
let pedido
let url_balcao
let url_cozinha
let url_cancelado
let url_teste = "https://formulasys.encontresuafranquia.com.br/teste_impressao.php";
let url_api = "http://apiformula.encontresuafranquia.com.br/api/andress";
let teste = false;

//URL OFICIAL PARA PEDIDOS
let urlBalcaoPedidoTelefone;
let urlCozinhaPedidoTelefone;
let urlBalcaoPedidoiFood;
let urlCozinhaPedidoiFood;
let urlCancelamento;
let urlSendStatus = 'http://apiformula.encontresuafranquia.com.br/api/peddings/sendStatus/';
let urlRequestNew = 'http://apiformula.encontresuafranquia.com.br/api/peddings/new/';

if (fs.existsSync(__dirname + '/files/id.json')) {
    fs.readFile(__dirname + '/files/id.json', { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            let dados = JSON.parse(data);
            loginSistema.value = dados.token;
            facaLogin.classList.replace('badge-danger', 'badge-success');
            facaLogin.innerText = "Ok";
        } else {
            facaLogin.classList.replace('badge-success', 'badge-danger');
            facaLogin.innerText = "Faça o login!";
        }
    });
} else {
    facaLogin.classList.replace('badge-success', 'badge-danger');
    facaLogin.innerText = "Faça o login!";
}


function atualizaPedido(v, token) {
    if (v.situacao == 'NOVO') {
        request(urlSendStatus + token + '/situacao/IMPRESSO/' + v.cod_pedidos, function (error, response, body) {
        });
    }
    if (v.impressao_cancelado == '1' || v.impressao_cancelado == 1) {
        request(urlSendStatus + token + '/impressao_cancelado/0/' + v.cod_pedidos, function (error, response, body) { });
    }
    if (v.reimpressao == '1' || v.reimpressao == 1) {
        request(urlSendStatus + token + '/reimpressao/0/' + v.cod_pedidos, function (error, response, body) { });
    }
}

//IMPRIME EM SÍ
function imprimir(janelaPrint, impressora, v, situacao, token) {
    janelaPrint.webContents.print(
        {
            silent: true,
            printBackground: false,
            deviceName: impressora
        },
        (err, outro) => {
            if (err) {
                if (document.querySelector('.alert.alert-info.p' + v.cod_pedidos)) {
                    document.querySelector('.alert.alert-info.p' + v.cod_pedidos).classList.remove('alert-info');
                    document.querySelector('.alert.p' + v.cod_pedidos + ' i').innerText = 'Imprimindo..';
                    document.querySelector('.alert.p' + v.cod_pedidos).classList.add('alert-success');
                    document.querySelector('.alert.p' + v.cod_pedidos).remove();
                }
                atualizaPedido(v, token);
            }
            janelaPrint.close();
            janelaPrint = null;
        }
    );
}

function novaImpressao(impressora, v, urlPedido, situacao, token) {
    let janelaPrint = new windowPrint({
        width: 200,
        height: 500,
        show: false
    });
    janelaPrint.loadURL(urlPedido);
    janelaPrint.webContents.once('dom-ready', () => {
        imprimir(janelaPrint, impressora, v, situacao, token);
    });

}


function botaoInicializaEstiloPause(este) {
    este.innerText = "Parando impressões";
    este.setAttribute('disabled', 'disabled');
    este.innerText = "Iniciar impressão!";
    este.classList.replace('btn-success', 'btn-danger');
    este.removeAttribute('disabled');
    este.setAttribute('iniciado', 'nao');
}

function botaoInicializaEstiloStart(este) {
    este.innerText = "Iniciando..";
    este.setAttribute('disabled', 'disabled');
    este.innerText = "Parar impressões";
    este.classList.replace('btn-danger', 'btn-success');
    este.removeAttribute('disabled');
    este.setAttribute('iniciado', 'sim');
}


function comecaImprimir() {

    imprimindo = setInterval(() => {
        fs.readFile(__dirname + '/files/impressoraSelecionada.json', { encoding: 'utf-8' }, function (err, data) {
            data = JSON.parse(data);
            impressoraDaCozinha = data.impressora_cozinha.impressora[0].name;
            impressoraDoBalcao = data.impressora_balcao.impressora[0].name;
            botaoInicializaEstiloStart(btnstartImpression);
            request(urlRequestNew + loginSistema.value + '/NOVO', function (error, response, body) {
                let pedidos = JSON.parse(body);
                cod_pedidos = [];
                pedidos.forEach((v, i) => {
                    if (v.origem_pedido == 'IFOOD') {
                        url_balcao = urlBalcaoPedidoiFood + v.cod_pedidos;
                        url_cozinha = urlCozinhaPedidoiFood + v.cod_pedidos;
                    } else {
                        url_balcao = urlBalcaoPedidoTelefone + v.cod_pedidos;
                        url_cozinha = urlCozinhaPedidoTelefone + v.cod_pedidos;
                    }
                    pedido = '<div class="alert alert-info p' + v.cod_pedidos + '"><span class="n_pedido"><strong>' + v.cod_pedidos + ' ' + v.origem_pedido + ' </strong></span><span><i> A ser impresso</i></span><button type="button" id="fechar" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>';
                    divImpressoes.innerHTML += pedido;
                    if (v.impressao_cancelado == "1" || v.impressao_cancelado == 1) {
                        url_cancelado = urlCancelamento + v.cod_pedidos;
                        novaImpressao(impressoraDoBalcao, v, url_cancelado, 'CANCELADO', loginSistema.value);
                    }
                    if (v.situacao == "NOVO") {
                        novaImpressao(impressoraDoBalcao, v, url_balcao, 'NOVO',loginSistema.value);
                        novaImpressao(impressoraDaCozinha, v, url_cozinha, 'NOVO', loginSistema.value);
                    }
                    if (v.reimpressao == "1" || v.reimpressao == 1) {
                        novaImpressao(impressoraDoBalcao, v, url_balcao, 'REIMPRESSAO',loginSistema.value);
                        novaImpressao(impressoraDaCozinha, v, url_cozinha, 'REIMPRESSAO', loginSistema.value);
                    }
                });
            });
        });
    }, 7201);
}

function incializaImpressao() {

    btnstartImpression.addEventListener('click', function (e) {
        e.preventDefault();

        let este = this;
        if (este.getAttribute('iniciado') == 'nao') {
            botaoInicializaEstiloStart(este);
            if (teste == false) {
                comecaImprimir();
            } else {
                novaImpressao(impressoraDoBalcao, null, url_teste, 'NOVO', loginSistema.value);
            }
        } else {
            botaoInicializaEstiloPause(este)
            clearInterval(imprimindo);
        }
    });
}

request(url_api, function (error, response, body) {
    if (!error) {
        body = JSON.parse(body);
        urlBalcaoPedidoTelefone = body.url_cupom_balcao;
        urlCozinhaPedidoTelefone = body.url_cupom_cozinha;
        urlBalcaoPedidoiFood = body.url_cupom_ifood_balcao;
        urlCozinhaPedidoiFood = body.url_cupom_ifood_cozinha;
        urlCancelamento = body.url_cupom_cancelamento;
        incializaImpressao();
    }
});