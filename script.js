let clientes = [];
let veiculos = [];
let funcionarios = [];
let atendimentos = [];
let servicosAtendimento = [];
let caixa = [];

let proximoIdCliente = 1;
let proximoIdVeiculo = 1;
let proximoIdFuncionario = 1;
let proximoIdAtendimento = 1;
let proximoIdServicoAtendimento = 1;
let proximoIdCaixa = 1;

const modalAddCliente = new bootstrap.Modal(document.getElementById('modalAddCliente'));
const modalAddVeiculo = new bootstrap.Modal(document.getElementById('modalAddVeiculo'));
const modalAddFuncionario = new bootstrap.Modal(document.getElementById('modalAddFuncionario'));
const modalAddAtendimento = new bootstrap.Modal(document.getElementById('modalAddAtendimento'));
const modalAddServicoAtendimento = new bootstrap.Modal(document.getElementById('modalAddServicoAtendimento'));
const modalRegistrarPagamento = new bootstrap.Modal(document.getElementById('modalRegistrarPagamento'));


function salvarDados() {
    localStorage.setItem('clientes', JSON.stringify(clientes));
    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    localStorage.setItem('atendimentos', JSON.stringify(atendimentos));
    localStorage.setItem('servicosAtendimento', JSON.stringify(servicosAtendimento));
    localStorage.setItem('caixa', JSON.stringify(caixa));

    localStorage.setItem('proximoIdCliente', proximoIdCliente);
    localStorage.setItem('proximoIdVeiculo', proximoIdVeiculo);
    localStorage.setItem('proximoIdFuncionario', proximoIdFuncionario);
    localStorage.setItem('proximoIdAtendimento', proximoIdAtendimento);
    localStorage.setItem('proximoIdServicoAtendimento', proximoIdServicoAtendimento);
    localStorage.setItem('proximoIdCaixa', proximoIdCaixa);
}

function carregarDados() {
    clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    veiculos = JSON.parse(localStorage.getItem('veiculos')) || [];
    funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    atendimentos = JSON.parse(localStorage.getItem('atendimentos')) || [];
    servicosAtendimento = JSON.parse(localStorage.getItem('servicosAtendimento')) || [];
    caixa = JSON.parse(localStorage.getItem('caixa')) || [];

    proximoIdCliente = parseInt(localStorage.getItem('proximoIdCliente')) || 1;
    proximoIdVeiculo = parseInt(localStorage.getItem('proximoIdVeiculo')) || 1;
    proximoIdFuncionario = parseInt(localStorage.getItem('proximoIdFuncionario')) || 1;
    proximoIdAtendimento = parseInt(localStorage.getItem('proximoIdAtendimento')) || 1;
    proximoIdServicoAtendimento = parseInt(localStorage.getItem('proximoIdServicoAtendimento')) || 1;
    proximoIdCaixa = parseInt(localStorage.getItem('proximoIdCaixa')) || 1;
}

function mostrarSecao(idSecao) {
    document.querySelectorAll('.conteudo-secao').forEach(secao => secao.style.display = 'none');
    document.getElementById(idSecao).style.display = 'block';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
    document.querySelector(`.navbar-nav .nav-link[onclick="mostrarSecao('${idSecao}')"]`).classList.add('active');

    if (idSecao === 'dashboard') renderizarDashboard();
    if (idSecao === 'clientes') renderizarClientes();
    if (idSecao === 'veiculos') { popularSelectClientesParaVeiculo(); renderizarVeiculos(); }
    if (idSecao === 'funcionarios') renderizarFuncionarios();
    if (idSecao === 'atendimentos') { popularSelectsParaAtendimento(); renderizarAtendimentosAtivos(); }
    if (idSecao === 'caixa') renderizarTransacoesCaixa();
}

function renderizarDashboard() {
    document.getElementById('totalClientes').textContent = clientes.length;
    document.getElementById('totalVeiculos').textContent = veiculos.length;
    document.getElementById('totalAtendimentosAndamento').textContent = atendimentos.filter(a => a.statusAtendimento === 'Em Andamento').length;
    document.getElementById('totalAguardandoPagamento').textContent = atendimentos.filter(a => a.statusAtendimento === 'Aguardando Pagamento').length;
}

document.getElementById('formAddCliente').addEventListener('submit', function (e) {
    e.preventDefault();
    clientes.push({
        idCliente: proximoIdCliente++,
        nomeCliente: document.getElementById('clienteNome').value,
        telefone: document.getElementById('clienteTelefone').value,
        email: document.getElementById('clienteEmail').value,
    });
    salvarDados();
    renderizarClientes();
    modalAddCliente.hide();
    this.reset();
});

function renderizarClientes() {
    const tbody = document.getElementById('listaClientes');
    tbody.innerHTML = '';
    clientes.forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${c.idCliente}</td>
            <td>${c.nomeCliente}</td>
            <td>${c.telefone}</td>
            <td>${c.email}</td>
            <td><button class="btn btn-sm btn-danger" onclick="removerCliente(${c.idCliente})">X</button></td>
        </tr>`;
    });
    popularSelectClientesParaVeiculo();
}
function removerCliente(idCliente){
    if (!confirm("Remover cliente? Isso pode afetar veículos e atendimentos associados!")) return;
    clientes = clientes.filter(c => c.idCliente !== idCliente);
    salvarDados();
    renderizarClientes();
}


function popularSelectClientesParaVeiculo() {
    const select = document.getElementById('veiculoClienteId');
    select.innerHTML = '<option value="">Selecione o Cliente</option>';
    clientes.forEach(c => {
        select.innerHTML += `<option value="${c.idCliente}">${c.nomeCliente}</option>`;
    });
}
document.getElementById('formAddVeiculo').addEventListener('submit', function (e) {
    e.preventDefault();
    veiculos.push({
        idVeiculo: proximoIdVeiculo++,
        idCliente: parseInt(document.getElementById('veiculoClienteId').value),
        placa: document.getElementById('veiculoPlaca').value.toUpperCase(),
        modelo: document.getElementById('veiculoModelo').value,
        observacoes: document.getElementById('veiculoObservacoes').value,
    });
    salvarDados();
    renderizarVeiculos();
    modalAddVeiculo.hide();
    this.reset();
});

function renderizarVeiculos() {
    const tbody = document.getElementById('listaVeiculos');
    tbody.innerHTML = '';
    veiculos.forEach(v => {
        const cliente = clientes.find(c => c.idCliente === v.idCliente);
        tbody.innerHTML += `<tr>
            <td>${v.idVeiculo}</td>
            <td>${v.placa}</td>
            <td>${v.modelo}</td>
            <td>${cliente ? cliente.nomeCliente : 'N/A'}</td>
            <td>${v.observacoes}</td>
            <td><button class="btn btn-sm btn-danger" onclick="removerVeiculo(${v.idVeiculo})">X</button></td>
        </tr>`;
    });
    popularSelectsParaAtendimento();
}
function removerVeiculo(idVeiculo){
    if (!confirm("Remover veículo?")) return;
    veiculos = veiculos.filter(v => v.idVeiculo !== idVeiculo);
    salvarDados();
    renderizarVeiculos();
}

document.getElementById('formAddFuncionario').addEventListener('submit', function(e) {
    e.preventDefault();
    funcionarios.push({
        idFuncionario: proximoIdFuncionario++,
        nomeFuncionario: document.getElementById('funcionarioNome').value,
        funcao: document.getElementById('funcionarioFuncao').value,
        statusFuncionario: document.getElementById('funcionarioStatus').value
    });
    salvarDados();
    renderizarFuncionarios();
    modalAddFuncionario.hide();
    this.reset();
});

function renderizarFuncionarios() {
    const tbody = document.getElementById('listaFuncionarios');
    tbody.innerHTML = '';
    funcionarios.forEach(f => {
        tbody.innerHTML += `<tr>
            <td>${f.idFuncionario}</td>
            <td>${f.nomeFuncionario}</td>
            <td>${f.funcao}</td>
            <td>${f.statusFuncionario}</td>
             <td><button class="btn btn-sm btn-danger" onclick="removerFuncionario(${f.idFuncionario})">X</button></td>
        </tr>`;
    });
    popularSelectsParaAtendimento();
}
function removerFuncionario(idFuncionario){
    if (!confirm("Remover funcionário?")) return;
    funcionarios = funcionarios.filter(f => f.idFuncionario !== idFuncionario);
    salvarDados();
    renderizarFuncionarios();
}


function popularSelectsParaAtendimento() {
    const selectVeiculo = document.getElementById('atendimentoVeiculoId');
    selectVeiculo.innerHTML = '<option value="">Selecione o Veículo</option>';
    veiculos.forEach(v => {
        const cliente = clientes.find(c => c.idCliente === v.idCliente);
        const emAtendimentoAtivo = atendimentos.some(a => a.idVeiculo === v.idVeiculo && (a.statusAtendimento === 'Em Andamento' || a.statusAtendimento === 'Aguardando Pagamento'));
        if (!emAtendimentoAtivo) {
            selectVeiculo.innerHTML += `<option value="${v.idVeiculo}">${v.placa} - ${v.modelo} (${cliente ? cliente.nomeCliente : 'N/A'})</option>`;
        }
    });

    const selectFuncionario = document.getElementById('atendimentoFuncionarioId');
    selectFuncionario.innerHTML = '<option value="">Selecione o Funcionário</option>';
    funcionarios.filter(f => f.statusFuncionario === 'Ativo').forEach(f => {
        selectFuncionario.innerHTML += `<option value="${f.idFuncionario}">${f.nomeFuncionario}</option>`;
    });
}

document.getElementById('formAddAtendimento').addEventListener('submit', function(e) {
    e.preventDefault();
    atendimentos.push({
        idAtendimento: proximoIdAtendimento++,
        idVeiculo: parseInt(document.getElementById('atendimentoVeiculoId').value),
        idFuncionario: parseInt(document.getElementById('atendimentoFuncionarioId').value),
        dataHoraEntrada: new Date().toISOString(),
        dataHoraSaida: null,
        statusAtendimento: 'Em Andamento'
    });
    salvarDados();
    renderizarAtendimentosAtivos();
    popularSelectsParaAtendimento();
    modalAddAtendimento.hide();
    this.reset();
});

function abrirModalAddServico(idAtendimento) {
    document.getElementById('servicoParaAtendimentoId').value = idAtendimento;
    modalAddServicoAtendimento.show();
}

document.getElementById('formAddServicoAtendimento').addEventListener('submit', function(e) {
    e.preventDefault();
    const idAtendimentoAtual = parseInt(document.getElementById('servicoParaAtendimentoId').value);
    servicosAtendimento.push({
        idServicoAtendimento: proximoIdServicoAtendimento++,
        idAtendimento: idAtendimentoAtual,
        tipoServico: document.getElementById('servicoTipo').value,
        valorCobradoServico: parseFloat(document.getElementById('servicoValor').value),
        quantidadeServico: parseInt(document.getElementById('servicoQuantidade').value)
    });
    salvarDados();
    renderizarAtendimentosAtivos();
    modalAddServicoAtendimento.hide();
    this.reset();
});

function concluirServicoAtendimento(idAtendimento) {
    const atendimento = atendimentos.find(a => a.idAtendimento === idAtendimento);
    if (atendimento) {
        atendimento.statusAtendimento = 'Aguardando Pagamento';
        atendimento.dataHoraSaida = new Date().toISOString();
        salvarDados();
        renderizarAtendimentosAtivos();
    }
}

function abrirModalPagamento(idAtendimento) {
    const atendimento = atendimentos.find(a => a.idAtendimento === idAtendimento);
    if (!atendimento) return;

    const veiculo = veiculos.find(v => v.idVeiculo === atendimento.idVeiculo);
    const cliente = veiculo ? clientes.find(c => c.idCliente === veiculo.idCliente) : null;
    
    let totalAPagar = 0;
    servicosAtendimento.filter(s => s.idAtendimento === idAtendimento).forEach(s => {
        totalAPagar += s.valorCobradoServico * s.quantidadeServico;
    });

    document.getElementById('pagamentoAtendimentoId').value = idAtendimento;
    document.getElementById('infoPagamentoAtendimentoId').textContent = idAtendimento;
    document.getElementById('infoPagamentoVeiculo').textContent = veiculo ? `${veiculo.placa} - ${veiculo.modelo} (${cliente ? cliente.nomeCliente : ''})` : 'N/A';
    document.getElementById('infoPagamentoTotal').textContent = totalAPagar.toFixed(2);
    document.getElementById('pagamentoValorTransacao').value = totalAPagar.toFixed(2);
    modalRegistrarPagamento.show();
}

function renderizarAtendimentosAtivos() {
    const container = document.getElementById('listaAtendimentosAtivos');
    container.innerHTML = '';

    const atendimentosFiltrados = atendimentos.filter(a => a.statusAtendimento === 'Em Andamento' || a.statusAtendimento === 'Aguardando Pagamento');
    
    if(atendimentosFiltrados.length === 0) {
        container.innerHTML = '<p>Nenhum atendimento ativo no momento.</p>';
        return;
    }

    atendimentosFiltrados.forEach(a => {
        const veiculo = veiculos.find(v => v.idVeiculo === a.idVeiculo);
        const cliente = veiculo ? clientes.find(c => c.idCliente === veiculo.idCliente) : null;
        const funcionario = funcionarios.find(f => f.idFuncionario === a.idFuncionario);

        let servicosHtml = '<ul class="servicos-lista">';
        let totalServicosValor = 0;
        servicosAtendimento.filter(s => s.idAtendimento === a.idAtendimento).forEach(s => {
            servicosHtml += `<li>${s.quantidadeServico}x ${s.tipoServico} - R$ ${(s.valorCobradoServico * s.quantidadeServico).toFixed(2)}</li>`;
            totalServicosValor += s.valorCobradoServico * s.quantidadeServico;
        });
        servicosHtml += `</ul> <strong>Total Serviços: R$ ${totalServicosValor.toFixed(2)}</strong>`;

        let botoesAcao = '';
        if (a.statusAtendimento === 'Em Andamento') {
            botoesAcao = `
                <button class="btn btn-sm btn-info me-2" onclick="abrirModalAddServico(${a.idAtendimento})">Adicionar Serviço</button>
                <button class="btn btn-sm btn-success" onclick="concluirServicoAtendimento(${a.idAtendimento})">Concluir Lavagem</button>
            `;
        } else if (a.statusAtendimento === 'Aguardando Pagamento') {
            botoesAcao = `<button class="btn btn-sm btn-primary" onclick="abrirModalPagamento(${a.idAtendimento})">Registrar Pagamento</button>`;
        }

        container.innerHTML += `
            <div class="card atendimento-card mb-3">
                <h5>Atendimento #${a.idAtendimento} - Status: ${a.statusAtendimento}</h5>
                <p><strong>Veículo:</strong> ${veiculo ? veiculo.placa + ' - ' + veiculo.modelo : 'N/A'} (${cliente ? cliente.nomeCliente : 'N/A'})</p>
                <p><strong>Funcionário:</strong> ${funcionario ? funcionario.nomeFuncionario : 'N/A'}</p>
                <p><strong>Entrada:</strong> ${new Date(a.dataHoraEntrada).toLocaleString()}</p>
                ${a.dataHoraSaida ? `<p><strong>Saída Programada/Realizada:</strong> ${new Date(a.dataHoraSaida).toLocaleString()}</p>` : ''}
                <h6>Serviços:</h6>
                ${servicosHtml}
                <div class="mt-2">${botoesAcao}</div>
            </div>
        `;
    });
}

document.getElementById('formRegistrarPagamento').addEventListener('submit', function(e) {
    e.preventDefault();
    const idAtendimentoPag = parseInt(document.getElementById('pagamentoAtendimentoId').value);
    
    caixa.push({
        idCaixa: proximoIdCaixa++,
        idAtendimento: idAtendimentoPag,
        dataHoraTransacao: new Date().toISOString(),
        valorTransacao: parseFloat(document.getElementById('pagamentoValorTransacao').value),
        tipoTransacao: document.getElementById('pagamentoTipoTransacao').value
    });

    const atendimentoPago = atendimentos.find(a => a.idAtendimento === idAtendimentoPag);
    if(atendimentoPago) {
        atendimentoPago.statusAtendimento = 'Pago/Concluído';
        if (!atendimentoPago.dataHoraSaida) {
            atendimentoPago.dataHoraSaida = new Date().toISOString();
        }
    }

    salvarDados();
    renderizarAtendimentosAtivos();
    renderizarTransacoesCaixa();
    popularSelectsParaAtendimento();
    modalRegistrarPagamento.hide();
    this.reset();
});

function renderizarTransacoesCaixa() {
    const tbody = document.getElementById('listaTransacoesCaixa');
    tbody.innerHTML = '';
    let totalArrecadado = 0;

    caixa.slice().reverse().forEach(t => {
        tbody.innerHTML += `<tr>
            <td>${t.idCaixa}</td>
            <td>${t.idAtendimento}</td>
            <td>${new Date(t.dataHoraTransacao).toLocaleString()}</td>
            <td>${t.valorTransacao.toFixed(2)}</td>
            <td>${t.tipoTransacao}</td>
        </tr>`;
        totalArrecadado += t.valorTransacao;
    });
    document.getElementById('totalArrecadadoCaixa').textContent = totalArrecadado.toFixed(2);
}


window.onload = () => {
    carregarDados();
    mostrarSecao('dashboard');
    
    document.getElementById('modalAddVeiculo').addEventListener('show.bs.modal', popularSelectClientesParaVeiculo);
    document.getElementById('modalAddAtendimento').addEventListener('show.bs.modal', popularSelectsParaAtendimento);

};