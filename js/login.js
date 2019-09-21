const formlogin = document.querySelector('form#loginformula')
const loginSistema = loginformula.querySelector('input[name="token"]')
const btnLogarSistema = loginformula.querySelector('input[type="submit"]')
const facaLogin = document.querySelector('#facaLogin');

formlogin.addEventListener('submit', function (e) {
    e.preventDefault();
    btnLogarSistema.setAttribute('disabled', 'disabled');
    btnLogarSistema.value = 'Salvando';
    fs.writeFileSync(__dirname+'/files/id.json', '{"token":"'+loginSistema.value+'"}', function (erro) {
        if (!erro) {
            btnLogarSistema.removeAttribute('disabled');
            btnLogarSistema.value = 'Salvo';
        }
    });
});
