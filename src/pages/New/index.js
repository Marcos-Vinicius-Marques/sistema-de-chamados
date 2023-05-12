import { useState, useEffect, useContext } from "react";
import { FiPlusCircle } from "react-icons/fi";
import Header from "../../components/Header";
import Title from "../../components/Title";

import { AuthContext } from '../../contexts/auth';
import { db } from "../../services/firebaseConnection";
import { collection, getDocs, getDoc, addDoc, doc, updateDoc } from "firebase/firestore";

import { useParams, useNavigate } from "react-router-dom";

import { toast } from 'react-toastify';

import './new.css';


export default function New() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([]);
    const [loadCustomres, setLoadCustomers] = useState(true);
    const [customerSelected, setCustomerSelected] = useState(0); // cliente que foi selecionado no select

    const [complemento, setComplemento] = useState('');
    const [assunto, setAssunto] = useState('Suporte');
    const [status, setStatus] = useState('Aberto');
    const [idCustomers, setIdCustomers] = useState(false);

    useEffect(() => {
        async function loadCustomres() {
            const querySnapshot = await getDocs(collection(db, "customers"))
                .then((snapShot) => {
                    let lista = [];

                    snapShot.forEach((doc) => {
                        lista.push({
                            id: doc.id,
                            nomeFantasia: doc.data().nomeFantasia
                        })
                    })

                    if (snapShot.docs.size === 0) {
                        console.log("NENHUMA EMPRESA ENCONTRADA");
                        setLoadCustomers(false);
                        return;
                    }

                    setCustomers(lista);
                    setLoadCustomers(false);

                    if (id) {
                        loadId(lista);
                    }
                })
                .catch((error) => {
                    console.log("ERRO AO BUSCAR OS CLIENTES", error);
                    setLoadCustomers(false);
                })
        }

        loadCustomres();
    }, [id])

    async function loadId(lista) {
        const docRef = doc(db, "chamados", id);
        await getDoc(docRef)
            .then((snapshot) => {
                setAssunto(snapshot.data().assunto);
                setStatus(snapshot.data().status);
                setComplemento(snapshot.data().complemento);

                let index = lista.findIndex(item => item.id === snapshot.data().clienteId);
                /* findIndex serve para fazer uma comparação. 
                no caso vai verificar se o item recebido no parâmetro realmente está na lita */
                setCustomerSelected(index);
                setIdCustomers(true);
            })
            .catch((error) => {
                setIdCustomers(false);
                console.log(error);
            })
    }

    function handleOptionChange(e) {
        setStatus(e.target.value);
    }

    function handleChangeSelect(e) {
        setAssunto(e.target.value);
        console.log(e.target.value);
    }

    function handleChangeCustomer(e) {
        setCustomerSelected(e.target.value);
    }

    async function handleRegister(e) {
        e.preventDefault();


        // editando/atualizando chamado
        if (idCustomers) {
            const docRef = doc(db, "chamados", id);
            await updateDoc(docRef, {
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                complemento: complemento,
                status: status,
                userId: user.uid,
            })
            .then(() => {
                toast.info("Chamado atualizado com sucesso!");
                setCustomerSelected(0);
                setComplemento('');
                navigate('/dashboard');
            })
            .catch((error) => {
                toast.error("Ops erro ao atualizar esse chamado!");
                console.log(error);
            })
            return;
        }

        // registrar chamado
        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid,
        })
            .then(() => {
                toast.success("Chamado registrado!");
                setComplemento('');
                setCustomerSelected(0);
            })
            .catch((error) => {
                console.log(error);
                toast.error("Ops, erro ao registrar, tente mais tarde");
            })
    }

    return (
        <div>
            <Header />

            <div className="content">
                <Title name={id ? "Editando Chamado" : "Novo Chamado"}>
                    <FiPlusCircle size={25} />
                </Title>

                <div className="container">
                    <form className="form-profile" onSubmit={handleRegister}>

                        <label for="clientes">Clientes</label>
                        {
                            loadCustomres ? (
                                <input type="text" disabled={true} value="Carregando..." />
                            ) : ( // vai pegar o nome fantasia do db e renderizar no option
                                <select value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, index) => {
                                        return (
                                            <option key={index} value={index}>
                                                {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label for="assuntos">Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect} id="assuntos">
                            <option value={"Suporte"}>Suporte</option>
                            <option value={"Visita Tecnica"}>Visita Tecnica</option>
                            <option value={"Financeiro"}>Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className="status">
                            <input
                                type="radio"
                                name="radio"
                                value="Aberto"
                                id="emAberto"
                                onChange={handleOptionChange}
                                checked={status === 'Aberto'}
                            />
                            <label for="emAberto"><span>Em aberto</span></label>

                            <input
                                type="radio"
                                name="radio"
                                value="Progresso"
                                id="progresso"
                                onChange={handleOptionChange}
                                checked={status === 'Progresso'}
                            />
                            <label for="progresso"><span>Progresso</span></label>

                            <input
                                type="radio"
                                name="radio"
                                value="Atendido"
                                id="atendido"
                                onChange={handleOptionChange}
                                checked={status === 'Atendido'}
                            />
                            <label for="atendido"><span>Atendido</span></label>
                        </div>


                        <label for="textArea">Complementos</label>
                        <textarea
                            id="textArea"
                            type="text"
                            placeholder="Descreva seu problema (ocpional)."
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        {idCustomers ? (
                            <button type="submit" className="submit">Editar</button>
                        ) : (
                            <button type="submit" className="submit">Registrar</button>
                        )}
                    </form>
                </div>
            </div>
        </div>
    )
}