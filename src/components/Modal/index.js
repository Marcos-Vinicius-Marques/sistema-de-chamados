import './modal.css'
import { FiX } from 'react-icons/fi'

export default function Modal({ informacoes, close }) {
    return (
        <div className='modal' onClick={close}>
            <div className='container'>
                <button className='close' onClick={close}>
                    <FiX size={25} color='#FFF' />
                    Voltar
                </button>

                <main>
                    <h2>Detalhes do chamado</h2>

                    <div className='row'>
                        <span>
                            Cliente: <i>{informacoes.cliente}</i>
                        </span>
                    </div>

                    <div className='row'>
                        <span>
                            Assunto: <i>{informacoes.assunto}</i>
                        </span>
                        <span>
                            Cadastrado em: <i>{informacoes.createdFormat}</i>
                        </span>
                    </div>

                    <div className='row'>
                        <span>
                            Status:
                            {informacoes.status === 'Aberto' && (
                                <i className='status-badge' style={{ backgroundColor: '#999' }}>
                                    {informacoes.status}
                                </i>
                            )}
                            {informacoes.status === 'Progresso' && (
                                <i className='status-badge' style={{ backgroundColor: '#f4a612' }}>
                                    {informacoes.status}
                                </i>
                            )}
                            {informacoes.status === 'Atendido' && (
                                <i className='status-badge' style={{ backgroundColor: '#5cb85c' }}>
                                    {informacoes.status}
                                </i>
                            )}
                        </span>
                    </div>

                    {informacoes.complemento !== '' && (
                        <>
                            <h3>complemento</h3>
                            <p>
                                {informacoes.complemento}
                            </p>
                        </>
                    )}
                </main>
            </div>
        </div>
    )
}