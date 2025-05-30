let clientes = JSON.parse(localStorage.getItem('der_clientes')) || [];
let veiculos = JSON.parse(localStorage.getItem('der_veiculos')) || [];
let funcionarios = JSON.parse(localStorage.getItem('der_funcionarios')) || [];
let atendimentos = JSON.parse(localStorage.getItem('der_atendimentos')) || [];
let servicos_atendimento = JSON.parse(localStorage.getItem('der_servicos_atendimento')) || [];
let caixa = JSON.parse(localStorage.getItem('der_caixa')) || [];
let agendamentos = JSON.parse(localStorage.getItem('der_agendamentos')) || [];

let proximoId = (arr) => arr.length > 0 ? Math.max(...arr.map(item => item.id)) + 1 : 1;

const modalAddCliente = new bootstrap.Modal(document.getElementById('modalAddCliente'));
const modalAddVeiculo = new bootstrap.Modal(document.getElementById('modalAddVeiculo'));
const modalNovoAtendimento = new bootstrap.Modal(document.getElementById('modalNovoAtendimento'));
const modalRegistrarPagamento = new bootstrap.Modal(document.getElementById('modalRegistrarPagamento'));
const modalAddAgendamento = new bootstrap.Modal(document.getElementById('modalAddAgendamento'));
const modalAddFuncionario = new bootstrap.Modal(document.getElementById('modalAddFuncionario'));
const modalEditFuncionario = new bootstrap.Modal(document.getElementById('modalEditFuncionario'));

let servicosTemporariosDoAtendimento = [];

function salvarDados() {
    localStorage.setItem('der_clientes', JSON.stringify(clientes));
    localStorage.setItem('der_veiculos', JSON.stringify(veiculos));
    localStorage.setItem('der_funcionarios', JSON.stringify(funcionarios));
    localStorage.setItem('der_atendimentos', JSON.stringify(atendimentos));
    localStorage.setItem('der_servicos_atendimento', JSON.stringify(servicos_atendimento));
    localStorage.setItem('der_caixa', JSON.stringify(caixa));
    localStorage.setItem('der_agendamentos', JSON.stringify(agendamentos));
}

function mostrarSecao(idSecao) {
    document.querySelectorAll('.conteudo-secao').forEach(secao => secao.style.display = 'none');
    document.getElementById(idSecao).style.display = 'block';
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    atualizarDashboard();
}

document.getElementById('formAddCliente').addEventListener('submit', function(e) {
    e.preventDefault();
    clientes.push({
        id: proximoId(clientes),
        nomeCliente: document.getElementById('clienteNome').value,
        telefone: document.getElementById('clienteTelefone').value,
        email: document.getElementById('clienteEmail').value
    });
    salvarDados();
    renderizarClientes();
    popularDropdownClientes();
    modalAddCliente.hide();
    this.reset();
});

function renderizarClientes() {
    const tbody = document.getElementById('listaClientes');
    tbody.innerHTML = '';
    clientes.forEach(cli => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cli.id}</td>
            <td>${cli.nomeCliente}</td>
            <td>${cli.telefone}</td>
            <td>${cli.email || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removerCliente(${cli.id})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function removerCliente(idCliente) {
    if (veiculos.some(v => v.idCliente === idCliente)) {
        alert('Não é possível remover cliente com veículos cadastrados. Remova os veículos primeiro.');
        return;
    }
    if (confirm(`Remover cliente ${clientes.find(c=>c.id === idCliente)?.nomeCliente}?`)) {
        clientes = clientes.filter(cli => cli.id !== idCliente);
        salvarDados();
        renderizarClientes();
        popularDropdownClientes();
        popularDropdownVeiculos();
    }
}

document.getElementById('formAddVeiculo').addEventListener('submit', function(e) {
    e.preventDefault();
    const placa = document.getElementById('veiculoPlaca').value.toUpperCase();
    if (veiculos.some(v => v.placa === placa)) {
        alert('Veículo com esta placa já cadastrado.');
        document.getElementById('veiculoPlaca').focus();
        return;
    }
    veiculos.push({
        id: proximoId(veiculos),
        idCliente: parseInt(document.getElementById('veiculoClienteId').value),
        placa: placa,
        modelo: document.getElementById('veiculoModelo').value,
        observacoes: document.getElementById('veiculoObservacoes').value
    });
    salvarDados();
    renderizarVeiculos();
    popularDropdownVeiculos();
    modalAddVeiculo.hide();
    this.reset();
});

function renderizarVeiculos() {
    const tbody = document.getElementById('listaVeiculos');
    tbody.innerHTML = '';
    veiculos.forEach(vec => {
        const cliente = clientes.find(cli => cli.id === vec.idCliente);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${vec.id}</td>
            <td>${vec.placa}</td>
            <td>${vec.modelo}</td>
            <td>${cliente ? cliente.nomeCliente : 'Cliente não encontrado'}</td>
            <td>${vec.observacoes || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removerVeiculo(${vec.id})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function removerVeiculo(idVeiculo) {
     if (atendimentos.some(at => at.idVeiculo === idVeiculo && (at.statusAtendimento === 'em_servico' || at.statusAtendimento === 'aguardando_pagamento'))) {
        alert('Não é possível remover veículo com atendimento em andamento.');
        return;
    }
    if (confirm(`Remover veículo ${veiculos.find(v=>v.id === idVeiculo)?.placa}?`)) {
        veiculos = veiculos.filter(vec => vec.id !== idVeiculo);
        salvarDados();
        renderizarVeiculos();
        popularDropdownVeiculos();
    }
}

document.getElementById('formAddFuncionario').addEventListener('submit', function(e) {
    e.preventDefault();
    funcionarios.push({
        id: proximoId(funcionarios), // idFuncionario
        nomeFuncionario: document.getElementById('funcionarioNome').value,
        funcao: document.getElementById('funcionarioFuncao').value,
        statusFuncionario: document.getElementById('funcionarioStatus').value
    });
    salvarDados();
    renderizarFuncionarios();
    popularDropdownFuncionarios();
    modalAddFuncionario.hide();
    this.reset();
});

document.getElementById('formEditFuncionario').addEventListener('submit', function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('editFuncionarioId').value);
    const funcIndex = funcionarios.findIndex(f => f.id === id);
    if (funcIndex > -1) {
        funcionarios[funcIndex].nomeFuncionario = document.getElementById('editFuncionarioNome').value;
        funcionarios[funcIndex].funcao = document.getElementById('editFuncionarioFuncao').value;
        funcionarios[funcIndex].statusFuncionario = document.getElementById('editFuncionarioStatus').value;
        salvarDados();
        renderizarFuncionarios();
        popularDropdownFuncionarios();
        modalEditFuncionario.hide();
    }
});

function abrirModalEditFuncionario(idFuncionario) {
    const func = funcionarios.find(f => f.id === idFuncionario);
    if (func) {
        document.getElementById('editFuncionarioId').value = func.id;
        document.getElementById('editFuncionarioNome').value = func.nomeFuncionario;
        document.getElementById('editFuncionarioFuncao').value = func.funcao;
        document.getElementById('editFuncionarioStatus').value = func.statusFuncionario;
        modalEditFuncionario.show();
    }
}

function removerFuncionario(idFuncionario) {
    if (atendimentos.some(at => at.idFuncionario === idFuncionario && (at.statusAtendimento === 'em_servico' || at.statusAtendimento === 'aguardando_pagamento'))) {
        alert('Não é possível remover funcionário com atendimento em andamento associado.');
        return;
    }
    if (confirm(`Remover funcionário ${funcionarios.find(f=>f.id === idFuncionario)?.nomeFuncionario}?`)) {
        funcionarios = funcionarios.filter(func => func.id !== idFuncionario);
        salvarDados();
        renderizarFuncionarios();
        popularDropdownFuncionarios();
    }
}

function renderizarFuncionarios() {
    const tbody = document.getElementById('listaFuncionarios');
    tbody.innerHTML = '';
    funcionarios.forEach(func => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${func.id}</td>
            <td>${func.nomeFuncionario}</td>
            <td>${func.funcao || '-'}</td>
            <td><span class="badge bg-${func.statusFuncionario === 'ativo' ? 'success' : 'danger'}">${func.statusFuncionario}</span></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="abrirModalEditFuncionario(${func.id})">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="removerFuncionario(${func.id})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}


function adicionarServicoAoAtendimentoTemporario() {
    const tipo = document.getElementById('novoTipoServico').value;
    const valor = parseFloat(document.getElementById('novoValorServico').value);
    const qtd = parseInt(document.getElementById('novoQtdServico').value);

    if (!tipo || isNaN(valor) || valor <= 0 || isNaN(qtd) || qtd <= 0) {
        alert('Preencha tipo, valor (maior que zero) e quantidade (maior que zero) do serviço.');
        return;
    }
    servicosTemporariosDoAtendimento.push({ tipoServico: tipo, valorCobradoServico: valor, quantidadeServico: qtd, id: Date.now() }); // id temporário para remoção
    renderizarServicosTemporarios();
    document.getElementById('novoTipoServico').value = '';
    document.getElementById('novoValorServico').value = '';
    document.getElementById('novoQtdServico').value = '1';
    document.getElementById('novoTipoServico').focus();
}

function removerServicoTemporario(idTemp) {
    servicosTemporariosDoAtendimento = servicosTemporariosDoAtendimento.filter(s => s.id !== idTemp);
    renderizarServicosTemporarios();
}

function renderizarServicosTemporarios() {
    const ul = document.getElementById('listaServicosTemporarios');
    const totalSpan = document.getElementById('totalServicosTemporarios');
    ul.innerHTML = '';
    let total = 0;
    servicosTemporariosDoAtendimento.forEach(s => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
            ${s.tipoServico} (Qtd: ${s.quantidadeServico} x R$ ${s.valorCobradoServico.toFixed(2)}) = R$ ${(s.quantidadeServico * s.valorCobradoServico).toFixed(2)}
            <button type="button" class="btn btn-xs btn-danger p-1" onclick="removerServicoTemporario(${s.id})">×</button>
        `;
        ul.appendChild(li);
        total += s.quantidadeServico * s.valorCobradoServico;
    });
    totalSpan.textContent = total.toFixed(2);
}

document.getElementById('formNovoAtendimento').addEventListener('submit', function(e) {
    e.preventDefault();
    const idVeiculo = parseInt(document.getElementById('atendimentoVeiculoId').value);
    const idFuncionario = parseInt(document.getElementById('atendimentoFuncionarioId').value);

    if (!idVeiculo || !idFuncionario) {
        alert('Selecione Veículo e Funcionário.');
        return;
    }
    if (servicosTemporariosDoAtendimento.length === 0) {
        alert('Adicione pelo menos um serviço ao atendimento.');
        return;
    }

    const novoAtendimentoId = proximoId(atendimentos);
    atendimentos.push({
        id: novoAtendimentoId,
        idVeiculo: idVeiculo,
        idFuncionario: idFuncionario,
        dataHoraEntrada: new Date(),
        dataHoraSaida: null,
        statusAtendimento: 'em_servico'
    });

    servicosTemporariosDoAtendimento.forEach(s => {
        servicos_atendimento.push({
            id: proximoId(servicos_atendimento),
            idAtendimento: novoAtendimentoId,
            tipoServico: s.tipoServico,
            valorCobradoServico: s.valorCobradoServico,
            quantidadeServico: s.quantidadeServico
        });
    });

    salvarDados();
    renderizarAtendimentos();
    atualizarDashboard();
    modalNovoAtendimento.hide();
    this.reset();
    servicosTemporariosDoAtendimento = [];
    renderizarServicosTemporarios();
});

function concluirServicosDoAtendimento(idAtendimento) {
    const atendimento = atendimentos.find(at => at.id === idAtendimento);
    if (atendimento && atendimento.statusAtendimento === 'em_servico') {
        atendimento.statusAtendimento = 'aguardando_pagamento';
        atendimento.dataHoraSaida = new Date();
        salvarDados();
        renderizarAtendimentos();
        atualizarDashboard();
    }
}

function abrirModalPagamento(idAtendimento) {
    const atendimento = atendimentos.find(at => at.id === idAtendimento);
    if (!atendimento) return;

    const veiculo = veiculos.find(v => v.id === atendimento.idVeiculo);
    const cliente = clientes.find(c => c.id === veiculo?.idCliente);
    const servicosDoAtend = servicos_atendimento.filter(sa => sa.idAtendimento === idAtendimento);
    let valorTotal = 0;
    servicosDoAtend.forEach(s => valorTotal += s.valorCobradoServico * s.quantidadeServico);

    document.getElementById('pagamentoAtendimentoId').value = idAtendimento;
    document.getElementById('infoPagamentoAtendimentoId').textContent = idAtendimento;
    document.getElementById('pagamentoVeiculoInfo').textContent = `${veiculo?.modelo} (${veiculo?.placa}) - Cliente: ${cliente?.nomeCliente || 'N/A'}`;
    document.getElementById('pagamentoValorTotalInfo').textContent = valorTotal.toFixed(2);
    document.getElementById('pagamentoValorTransacao').value = valorTotal.toFixed(2);
    document.getElementById('pagamentoValorTransacao').min = valorTotal.toFixed(2);

    modalRegistrarPagamento.show();
}

document.getElementById('formRegistrarPagamento').addEventListener('submit', function(e){
    e.preventDefault();
    const idAtendimento = parseInt(document.getElementById('pagamentoAtendimentoId').value);
    const valorTransacao = parseFloat(document.getElementById('pagamentoValorTransacao').value);
    const tipoTransacao = document.getElementById('pagamentoTipoTransacao').value;

    const atendimento = atendimentos.find(at => at.id === idAtendimento);
    if (!atendimento) return;
    
    const servicosDoAtend = servicos_atendimento.filter(sa => sa.idAtendimento === idAtendimento);
    let valorTotalServicos = 0;
    servicosDoAtend.forEach(s => valorTotalServicos += s.valorCobradoServico * s.quantidadeServico);

    if (valorTransacao < valorTotalServicos) {
        alert(`O valor pago (R$ ${valorTransacao.toFixed(2)}) não pode ser menor que o total dos serviços (R$ ${valorTotalServicos.toFixed(2)}).`);
        return;
    }


    caixa.push({
        id: proximoId(caixa),
        idAtendimento: idAtendimento,
        dataHoraTransacao: new Date(),
        valorTransacao: valorTransacao,
        tipoTransacao: tipoTransacao
    });

    atendimento.statusAtendimento = 'finalizado';

    salvarDados();
    renderizarAtendimentos();
    renderizarRelatorios();
    atualizarDashboard();
    exportarComprovanteAtendimento(idAtendimento);
    modalRegistrarPagamento.hide();
    this.reset();
});


function renderizarAtendimentos() {
    const tbodyEmAndamento = document.getElementById('listaAtendimentosEmAndamento');
    const tbodyAguardandoPgto = document.getElementById('listaAtendimentosAguardandoPagamento');
    tbodyEmAndamento.innerHTML = '';
    tbodyAguardandoPgto.innerHTML = '';

    atendimentos.forEach(at => {
        const veiculo = veiculos.find(v => v.id === at.idVeiculo);
        const cliente = clientes.find(c => c.id === veiculo?.idCliente);
        const funcionario = funcionarios.find(f => f.id === at.idFuncionario);
        const servicosDoAtend = servicos_atendimento.filter(sa => sa.idAtendimento === at.id);
        
        let htmlServicos = '<ul class="list-unstyled mb-0 small">';
        let valorTotalAtendimento = 0;
        servicosDoAtend.forEach(s => {
            htmlServicos += `<li>- ${s.tipoServico} (R$ ${s.valorCobradoServico.toFixed(2)} x ${s.quantidadeServico})</li>`;
            valorTotalAtendimento += s.valorCobradoServico * s.quantidadeServico;
        });
        htmlServicos += '</ul>';

        if (!veiculo || !funcionario) return;

        const tr = document.createElement('tr');
        let acoesHtml = '';

        if (at.statusAtendimento === 'em_servico') {
            acoesHtml = `<button class="btn btn-sm btn-success" onclick="concluirServicosDoAtendimento(${at.id})">Concluir Serviços</button>`;
            tr.innerHTML = `
                <td>${at.id}</td>
                <td>${veiculo.placa}</td>
                <td>${cliente?.nomeCliente || 'N/A'}</td>
                <td>${funcionario.nomeFuncionario}</td>
                <td>${new Date(at.dataHoraEntrada).toLocaleString()}</td>
                <td><span class="badge bg-info text-dark">Em Serviço</span></td>
                <td>${htmlServicos}</td>
                <td>R$ ${valorTotalAtendimento.toFixed(2)}</td>
                <td>${acoesHtml}</td>
            `;
            tbodyEmAndamento.appendChild(tr);
        } else if (at.statusAtendimento === 'aguardando_pagamento') {
             acoesHtml = `<button class="btn btn-sm btn-primary" onclick="abrirModalPagamento(${at.id})">Registrar Pagamento</button>`;
             tr.innerHTML = `
                <td>${at.id}</td>
                <td>${veiculo.placa}</td>
                <td>${cliente?.nomeCliente || 'N/A'}</td>
                <td>${funcionario.nomeFuncionario}</td>
                <td>${at.dataHoraSaida ? new Date(at.dataHoraSaida).toLocaleString() : 'N/A'}</td>
                <td><span class="badge bg-warning text-dark">Aguard. Pagamento</span></td>
                <td>${htmlServicos}</td>
                <td>R$ ${valorTotalAtendimento.toFixed(2)}</td>
                <td>${acoesHtml}</td>
            `;
            tbodyAguardandoPgto.appendChild(tr);
        }
    });
}

document.getElementById('formAddAgendamento').addEventListener('submit', function(e) {
    e.preventDefault();
    const dataHora = document.getElementById('agendamentoDataHora').value;
    const idVeiculo = parseInt(document.getElementById('agendamentoVeiculoSelect').value);
    const obs = document.getElementById('agendamentoObs').value;

    if (!dataHora || !idVeiculo) {
        alert('Preencha Data/Hora e selecione o Veículo para o agendamento.');
        return;
    }
    
    agendamentos.push({
        id: proximoId(agendamentos),
        dataHora: new Date(dataHora),
        idVeiculo: idVeiculo,
        obs
    });
    salvarDados();
    renderizarAgendamentos();
    atualizarDashboard();
    modalAddAgendamento.hide();
    this.reset();
});

function removerAgendamento(idAgendamento) {
    agendamentos = agendamentos.filter(a => a.id !== idAgendamento);
    salvarDados();
    renderizarAgendamentos();
    atualizarDashboard();
}

function renderizarAgendamentos() {
    const tbody = document.getElementById('listaAgendamentos');
    tbody.innerHTML = '';
    const agendamentosOrdenados = [...agendamentos].sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

    agendamentosOrdenados.forEach(ag => {
        const veiculo = veiculos.find(v => v.id === ag.idVeiculo);
        const cliente = clientes.find(c => c.id === veiculo?.idCliente);

        if (!veiculo || !cliente) return;

        const tr = document.createElement('tr');
        const agora = new Date();
        const dataAg = new Date(ag.dataHora);
        if (dataAg < agora && dataAg.toDateString() !== agora.toDateString()) {
            tr.classList.add('table-secondary', 'text-muted');
        } else if (Math.abs(dataAg - agora) < (2 * 60 * 60 * 1000) && dataAg >= agora ) {
             tr.classList.add('table-warning'); 
        }

        tr.innerHTML = `
            <td>${dataAg.toLocaleString()}</td>
            <td>${cliente.nomeCliente}</td>
            <td>${veiculo.modelo} (${veiculo.placa})</td>
            <td>${ag.obs || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removerAgendamento(${ag.id})">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderizarRelatorios() {
    const hojeStr = new Date().toLocaleDateString();
    let atendimentosFinalizadosHoje = 0;
    let faturamentoHoje = 0;

    const tbodyHistorico = document.getElementById('historicoAtendimentos');
    tbodyHistorico.innerHTML = '';

    const atendimentosFinalizados = atendimentos.filter(at => at.statusAtendimento === 'finalizado');
    atendimentosFinalizados.sort((a,b) => new Date(b.dataHoraSaida) - new Date(a.dataHoraSaida)); 

    atendimentosFinalizados.forEach(at => {
        const transacaoCaixa = caixa.find(cx => cx.idAtendimento === at.id);
        const dataSaidaAtendimentoStr = at.dataHoraSaida ? new Date(at.dataHoraSaida).toLocaleDateString() : '';
        
        if (dataSaidaAtendimentoStr === hojeStr && transacaoCaixa) {
            atendimentosFinalizadosHoje++;
            faturamentoHoje += transacaoCaixa.valorTransacao;
        }

        const veiculo = veiculos.find(v => v.id === at.idVeiculo);
        const cliente = clientes.find(c => c.id === veiculo?.idCliente);
        const funcionario = funcionarios.find(f => f.id === at.idFuncionario);

        if (!veiculo || !cliente || !funcionario || !transacaoCaixa) return;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${at.id}</td>
            <td>${new Date(at.dataHoraSaida).toLocaleString()}</td>
            <td>${cliente.nomeCliente}</td>
            <td>${veiculo.modelo} (${veiculo.placa})</td>
            <td>${funcionario.nomeFuncionario}</td>
            <td>R$ ${transacaoCaixa.valorTransacao.toFixed(2)}</td>
        `;
        tbodyHistorico.appendChild(tr);
    });

    document.getElementById('atendimentosHoje').textContent = atendimentosFinalizadosHoje;
    document.getElementById('faturamentoHoje').textContent = faturamentoHoje.toFixed(2);
}

function atualizarDashboard() {
    const emServicoCount = atendimentos.filter(at => at.statusAtendimento === 'em_servico').length;
    const aguardandoPgtoCount = atendimentos.filter(at => at.statusAtendimento === 'aguardando_pagamento').length;
    document.getElementById('totalVeiculosEmAtendimento').textContent = emServicoCount + aguardandoPgtoCount;

    const agora = new Date();
    const proximas24h = new Date(agora);
    proximas24h.setDate(agora.getDate() + 1);

    const agendamentosProximos = agendamentos.filter(ag => {
        const dataAg = new Date(ag.dataHora);
        return dataAg >= agora && dataAg <= proximas24h;
    }).sort((a,b) => new Date(a.dataHora) - new Date(b.dataHora)).slice(0, 3);

    const listaAgendamentosProximosEl = document.getElementById('agendamentosProximosLista');
    listaAgendamentosProximosEl.innerHTML = '';
    if (agendamentosProximos.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'list-group list-group-flush';
        agendamentosProximos.forEach(ag => {
            const veiculo = veiculos.find(v => v.id === ag.idVeiculo);
            const cliente = clientes.find(c => c.id === veiculo?.idCliente);
            if(cliente && veiculo) {
                const li = document.createElement('li');
                li.className = 'list-group-item small';
                li.textContent = `${new Date(ag.dataHora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${cliente.nomeCliente} (${veiculo.placa})`;
                ul.appendChild(li);
            }
        });
        listaAgendamentosProximosEl.appendChild(ul);
    } else {
        listaAgendamentosProximosEl.textContent = 'Nenhum agendamento para as próximas 24 horas.';
    }
}

// comprovante 
function exportarComprovanteAtendimento(idAtendimento) {
    const atendimento = atendimentos.find(at => at.id === idAtendimento);
    if (!atendimento) return;

    const veiculo = veiculos.find(v => v.id === atendimento.idVeiculo);
    const cliente = clientes.find(c => c.id === veiculo?.idCliente);
    const funcionario = funcionarios.find(f => f.id === atendimento.idFuncionario);
    const transacao = caixa.find(cx => cx.idAtendimento === idAtendimento && cx.idAtendimento === atendimento.id);
    const servicosDoAtend = servicos_atendimento.filter(sa => sa.idAtendimento === idAtendimento);

    let comprovanteConteudo = `
        LAVA-RÁPIDO APP - COMPROVANTE
        ---------------------------------------
        Atendimento ID: ${atendimento.id}
        Data/Hora Saída: ${atendimento.dataHoraSaida ? new Date(atendimento.dataHoraSaida).toLocaleString() : 'N/A'}
        Cliente: ${cliente?.nomeCliente || 'N/A'} (Tel: ${cliente?.telefone || 'N/A'})
        Veículo: ${veiculo?.modelo || 'N/A'} (Placa: ${veiculo?.placa || 'N/A'})
        Funcionário: ${funcionario?.nomeFuncionario || 'N/A'}
        ---------------------------------------
        Serviços Realizados:
`;
    let valorTotalCalculado = 0;
    servicosDoAtend.forEach(s => {
        const subtotal = s.valorCobradoServico * s.quantidadeServico;
        comprovanteConteudo += `        - ${s.tipoServico} (Qtd: ${s.quantidadeServico} x R$ ${s.valorCobradoServico.toFixed(2)}) = R$ ${subtotal.toFixed(2)}\n`;
        valorTotalCalculado += subtotal;
    });
    comprovanteConteudo += `
        ---------------------------------------
        Valor Total dos Serviços: R$ ${valorTotalCalculado.toFixed(2)}
        Valor Pago: R$ ${transacao ? transacao.valorTransacao.toFixed(2) : 'N/A'}
        Tipo Pagamento: ${transacao ? transacao.tipoTransacao : 'N/A'}
        Data Pagamento: ${transacao ? new Date(transacao.dataHoraTransacao).toLocaleString() : 'N/A'}
        ---------------------------------------
        Obrigado pela preferência!
    `;
    
    const blob = new Blob([comprovanteConteudo.replace(/(\r\n|\n|\r)/gm, "\r\n")], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comprovante_atendimento_${atendimento.id}_${veiculo?.placa || 'VEICULO'}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
}


function popularDropdownClientes() {
    const select = document.getElementById('veiculoClienteId');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione o Cliente...</option>';
    clientes.forEach(cli => {
        const option = document.createElement('option');
        option.value = cli.id;
        option.textContent = `${cli.nomeCliente} (ID: ${cli.id})`;
        select.appendChild(option);
    });
}

function popularDropdownVeiculos() {
    const selects = [
        document.getElementById('atendimentoVeiculoId'),
        document.getElementById('agendamentoVeiculoSelect')
    ];
    selects.forEach(select => {
        if (!select) return;
        const currentValue = select.value;
        select.innerHTML = '<option value="">Selecione o Veículo...</option>';
        veiculos.forEach(vec => {
            const cliente = clientes.find(cli => cli.id === vec.idCliente);
            if (cliente) {
                const option = document.createElement('option');
                option.value = vec.id;
                option.textContent = `${cliente.nomeCliente} - ${vec.modelo} (${vec.placa})`;
                select.appendChild(option);
            }
        });
        select.value = currentValue;
    });
}

function popularDropdownFuncionarios() {
    const select = document.getElementById('atendimentoFuncionarioId');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione o Funcionário...</option>';
    funcionarios.filter(f => f.statusFuncionario === 'ativo').forEach(func => {
        const option = document.createElement('option');
        option.value = func.id;
        option.textContent = func.nomeFuncionario;
        select.appendChild(option);
    });
}

window.onload = () => {
    renderizarClientes();
    renderizarVeiculos();
    renderizarFuncionarios();
    renderizarAtendimentos();
    renderizarAgendamentos();
    renderizarRelatorios();

    popularDropdownClientes();
    popularDropdownVeiculos();
    popularDropdownFuncionarios();
    
    atualizarDashboard(); 
    
    document.getElementById('modalNovoAtendimento').addEventListener('show.bs.modal', () => {
        popularDropdownVeiculos();
        popularDropdownFuncionarios();
        servicosTemporariosDoAtendimento = [];
        renderizarServicosTemporarios();
    });
    document.getElementById('modalAddVeiculo').addEventListener('show.bs.modal', popularDropdownClientes);
    document.getElementById('modalAddAgendamento').addEventListener('show.bs.modal', popularDropdownVeiculos);


    mostrarSecao('dashboard');
    document.querySelector('.navbar-nav .nav-link[onclick*="dashboard"]').classList.add('active');

    setInterval(() => {
        if (document.getElementById('agendamentos').style.display === 'block') {
            renderizarAgendamentos();
        }
        atualizarDashboard(); 
    }, 60 * 1000); 
};