import './dashboard.css'
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/auth";

import Header from "../../components/Header";
import Title from "../../components/Title";
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi';

import { Link } from "react-router-dom";
import {
    collection, // pra acessar a coleção/armazenamento desejado
    getDocs, // pra armazenar a coleção que foi pegada
    orderBy, // server para escolher a forma/ordem de como vai ser exibido a coleção
    startAfter, /* vai buscar item/chamados depois do item/chamado selecionado, 
                    vai ser usado para carregar mais chamados caso chegar no limite do "limit" */
    query, // pra poder fazer uma busca ordenada e com limite usando o "orderBy" e o "limit"
    limit // limite de exibição da coleção
} from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';

import { format } from 'date-fns'; // biblioteca de datas
import Modal from '../../components/Modal';

const listRef = collection(db, 'chamados');


// página da tabela dos clientes
export default function Dashboard() {
    const { logout } = useContext(AuthContext);

    const [chamados, setChamados] = useState([]); // vai armazenar os chamados
    const [loading, setLoading] = useState(true);


    const [isEmpty, setIsEmpty] = useState(false); // botão para buscar mais itens
    const [lastDocs, setLastDocs] = useState(); // vai armazenar o ultimo item/chamado renderizado na tela
    const [loadingMore, setLoadingMore] = useState(false); // elemento que irá aparecer com true insinuando que está buscando mais itens e false irá aparecer o botão

    const [showPostModal, setShowPostModal] = useState(false); // vai contorla a axibição do Modal (janela do detalhes da compra)
    const [detail, setDetail] = useState(); // vai receber as informações do chamado clicado

    useEffect(() => {
        async function loadChamados() {
            const q = query(listRef, orderBy('created', 'desc'), limit(5)); // busca ordenada com limite de 5 chamados

            const querySnapshot = await getDocs(q);
            await updateState(querySnapshot);

            setLoading(false);
        }

        loadChamados();

        return () => { }
    }, [])

    // função que vai receber todos os chamados obtidos do useEffect
    async function updateState(querySnapshot) {
        const isCollectionEmpty = querySnapshot.size === 0;

        if (!isCollectionEmpty) { // se tiver alguma coisa na lista
            let lista = [];

            querySnapshot.forEach((doc) => {
                lista.push({
                    id: doc.id,
                    assunto: doc.data().assunto,
                    cliente: doc.data().cliente,
                    clienteId: doc.data().clienteId,
                    created: doc.data().created,
                    createdFormat: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
                    status: doc.data().status,
                    complemento: doc.data().complemento,
                })
            })

            const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]; // pegando o ultimo item renderizado
            
            setChamados(chamados => [...chamados, ...lista]);
            setLastDocs(lastDoc); // armazenando o ultimo chamado na state para poder ser usado na função "handleMore"

        } else { // se a lista estiver vazia
            setIsEmpty(true);
        }
        setLoadingMore(false);
    }

    // função para buscar/renderizar mais itens caso o usuário queira após chegar no limite renderizado
    async function handleMore() {
        setLoadingMore(true);
        const q = query(listRef, orderBy('created', 'desc'), startAfter(lastDocs), limit(5)); // buscando mais 5 chamados de maneira ordenada
        const querySnapshot = await getDocs(q);
        await updateState(querySnapshot);
    }

    // função responsável para abrir e fechar o modal
    function toggleModal(item) {
        setShowPostModal(!showPostModal);/* se showPostModal estiver como true, ele vai pra false, 
                                            e se ele já estiver como false, como é uma negação vai mudar o false pra true.
                                            Então false com false da true, renderizando por fim o modal */
        setDetail(item);
    }

    if (loading) {
        return (
            <div>
                <Header />

                <div className='content'>
                    <Title name={"Tickets"}>
                        <FiMessageSquare size={25} />
                    </Title>

                    <div className='container dashboard'>
                        <span>Buscando chamados...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            <Header />
            <div className="content">
                <Title name={"Tickets"}>
                    <FiMessageSquare size={25} />
                </Title>

                <>

                    {chamados.length === 0 ? (
                        <div className='container dashboard'>
                            <span>Nenhum chamado encontrado...</span>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo chamado
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/new" className="new">
                                <FiPlus color="#FFF" size={25} />
                                Novo chamado
                            </Link>
                            <table>
                                {/* cabeçalho da tabela */}
                                <thead>
                                    <tr>
                                        <th scope='col'>Cliente</th>
                                        <th scope='col'>Assunto</th>
                                        <th scope='col'>Status</th>
                                        <th scope='col'>Cadastrado</th>
                                        <th scope='col'>#</th>
                                    </tr>
                                </thead>
                                {/* corpo da tabela */}
                                <tbody>
                                    {chamados.map((item, index) => {
                                        return (
                                            <tr key={index}>
                                                <td data-label="Cliente">{item.cliente}</td>
                                                <td data-label="Assunto">{item.assunto}</td>
                                                <td data-label="Status">
                                                    {item.status === "Aberto" && (
                                                        <span className='badge' style={{ backgroundColor: '#999' }}>
                                                        {item.status}
                                                    </span>
                                                    )}
                                                    {item.status === "Progresso" && (
                                                        <span className='badge' style={{ backgroundColor: '#f4a612' }}>
                                                        {item.status}
                                                    </span>
                                                    )}
                                                    {item.status === "Atendido" && (
                                                        <span className='badge' style={{ backgroundColor: '#5cb85c' }}>
                                                        {item.status}
                                                    </span>
                                                    )}
                                                </td>
                                                <td data-label="Cadastrado">{item.createdFormat}</td>
                                                <td data-label="#">
                                                    <button onClick={()=> toggleModal(item)}  className='action' style={{ backgroundColor: '#3583f6' }}>
                                                        <FiSearch color='#FFF' size={17} />
                                                    </button>
                                                    <Link to={`/new/${item.id}`} className='action' style={{ backgroundColor: '#f6a935' }}>
                                                        <FiEdit2 color='#FFF' size={17} />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {loadingMore && <h3 style={{marginTop: "15px"}}>Buscando mais chamados...</h3>}
                            {!loadingMore && !isEmpty && 
                                <button onClick={handleMore} className='btn-more'>Buscar mais</button>
                            }
                        </>

                    )}
                </>
            </div>

            {showPostModal && (
                <Modal 
                    informacoes={detail}
                    close={() => setShowPostModal(!showPostModal)}
                />
            )}

        </div>
    )
}