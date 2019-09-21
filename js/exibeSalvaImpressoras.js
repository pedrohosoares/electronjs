let divSalvaImpressoras = document.querySelector("#salvaImpressoras")
let formcadastradados = document.querySelector('div#cadastro.partes form#cadastroInformacoes')
let impressora_balcao = document.querySelector('select[name="impressora_balcao"]')
let impressora_cozinha = document.querySelector('select[name="impressora_cozinha"]')
let botaoSubmeteImpressora = formcadastradados.querySelector('input[type="submit"]')
let impressoraDaCozinha
let impressoraDoBalcao

function abreImpressoraSelecionadas(){
    fs.readFile(__dirname+'/files/impressoraSelecionada.json',{encoding:'utf-8'},function(err,data){
        
        let nameImpressoras = JSON.parse(data);

        if(nameImpressoras.impressora_cozinha.impressora[0].name){
            impressora_cozinha.value = nameImpressoras.impressora_cozinha.impressora[0].name;
        }
        if(nameImpressoras.impressora_balcao.impressora[0].name){
            impressora_balcao.value = nameImpressoras.impressora_balcao.impressora[0].name;
        }

    });
}

function abreLeImpressoras() {
    fs.readFile(__dirname+'/files/impressoras.json', { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            divSalvaImpressoras.innerHTML = data;
            JSON.parse(data).forEach(function (v, i) {
                impressora_balcao.innerHTML += "<option value='" + v.name + "'>" + v.name + "</option>";
                impressora_cozinha.innerHTML += "<option value='" + v.name + "'>" + v.name + "</option>";
                abreImpressoraSelecionadas();
            });
        } else {
            console.log(err);
        }
    });
}
abreLeImpressoras();


formcadastradados.addEventListener('submit', function (e) {
    e.preventDefault();
    botaoSubmeteImpressora.setAttribute('disabled', 'disabled');
    botaoSubmeteImpressora.innerText = "Salvando..";

    let dados = {
        "impressora_cozinha": {
            "impressora": [],
        },
        "impressora_balcao": {
            "impressora": []
        }
    };

    JSON.parse(divSalvaImpressoras.innerHTML).forEach(function (v, i) {
        if (v.name == impressora_balcao.value) {
            dados.impressora_balcao.impressora.push(v);
        }
        if (v.name == impressora_cozinha.value) {
            dados.impressora_cozinha.impressora.push(v);
        }
    });

    fs.writeFileSync(__dirname+'/files/impressoraSelecionada.json', JSON.stringify(dados), function (erro) {
        if (!erro) {

        }
    });
    
    fechar.parentNode.style = "";
    fechar.parentNode.classList.remove('alert-warning');
    fechar.parentNode.classList.add('alert-success');  
    fechar.parentNode.querySelector("span.mgs").innerText = "Salvo com sucesso!";          
    botaoSubmeteImpressora.removeAttribute('disabled');
    botaoSubmeteImpressora.innerText = "Cadastrar";
});