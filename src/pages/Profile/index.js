import { useContext, useState } from "react";
import Header from "../../components/Header";
import Title from "../../components/Title";

import { FiSettings, FiUpload } from 'react-icons/fi';
import avatar from '../../assets/avatar.png';
import { AuthContext } from '../../contexts/auth';

import { db, storage } from '../../services/firebaseConnection';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, // para acessar a referência do Storage
        uploadBytes, // para enviar fotos
        getDownloadURL // pra poder pegar a URL de retorno da foto que foi enviado
     } from 'firebase/storage'

import { toast } from 'react-toastify'

import './profile.css'

export default function Profile() {

    const { user, // informações do usuário
            storageUser, // atualizar e pegar os dados do usuário no local storage
            setUser, // função para alterar o nome do usuário na página de Perfil
            logout // deslogar usuário
          } = useContext(AuthContext);

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl); /* vai receber a foto de perfil do usuário se tiver, se não vai ser nulo */
    const [imageAvatar, setImageAvatar] = useState(null); // input que vai pegar o arquivo de imagem selecionado e armazenar temporariamente

    const [nome, setNome] = useState(user && user.nome); /* vai receber o nome do usuário se tiver, se não vai ser nulo */
    const [email, setEmail] = useState(user && user.email); /* vai receber email do usuário se tiver, se não vai ser nulo */

    function handleFile(e) {
        if(e.target.files[0]){
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image/png') { // condição do tipo de imagem que vai ser aceita
                setImageAvatar(image);
                setAvatarUrl(URL.createObjectURL(image)); // vai criar uma URL pra image
            } else {
                alert("Envie uma imagem do tipo PNG ou JPEG");
                setImageAvatar(null);
                return;
            }
        }
    }

    // atualizar nome e a foto (handleSubmit que ativa essa função)
    async function handleUpload(){
        const currentUid = user.uid;

        const uploadRef = ref(storage, `images/${currentUid}/${imageAvatar.name}`); // para acessar a referência do Storage
        const uploadTask = uploadBytes(uploadRef, imageAvatar)
        .then((snapshot)=>{
            getDownloadURL(snapshot.ref).then(async (dowloadUrl)=>{ // pra poder pegar a URL de retorno da foto que foi enviado
                let urlFoto = dowloadUrl;
                const docRef = doc(db, "users", user.uid);
                await updateDoc(docRef, {
                    avatarUrl: urlFoto,
                    nome: nome,
                })
                .then(()=>{
                    let data = {
                        ...user,
                        nome: nome,
                        avatarUrl: urlFoto,
                    }
                    setUser(data); // atualizar dados do usuário
                    storageUser(data); // atualizar dados do localstorage
                    toast.success("Atualizado com sucesso!");
                })
            })
        })
    }

    // função ao clicar no botão salvar
    async function handleSubmit(e){ 
        e.preventDefault();
        
        if(imageAvatar === null && nome !== ''){
            // Atualizar apenas o nome do user
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                nome: nome,
            })
            .then(()=>{
                let data = {
                    ...user,
                    nome: nome,
                }
                setUser(data); // vai atualizar o nome
                storageUser(data); // vai atualizar o localstorage
                toast.success("Atualizado com sucesso!");
            })
            .catch((error)=>{
                console.log(error)
            })
        } else if(nome !== '' && imageAvatar !== null){
            // Atualizar nome e a foto
            handleUpload();
        }
    }

    return (
        <div>
            <Header />

            <div className="content">
                <Title name="Minha conta">
                    <FiSettings size={25} />
                </Title>

                <div className="container">

                    <form action="" className="form-profile" onSubmit={handleSubmit}>
                        <label className="label-avatar">
                            <span>
                                <FiUpload color="#FFF" size={25} />
                            </span>

                            <input type="file" accept="image/*" onChange={handleFile}/>
                            <br />
                            {avatarUrl == null ? (
                                <img src={avatar} alt="avatar" width={250} height={250} /> // se não tiver foto de perfil
                            ) : (
                                <img src={avatarUrl} alt="Foto do perfil" width={250} height={250} /> // se tiver foto de perfil
                            )}
                        </label>

                        <label>Nome</label>
                        <input type="text" value={nome} onChange={(e)=> setNome(e.target.value)}/>

                        <label>Email</label>
                        <input type="text" value={email} disabled={true}/>

                        <button type="submit">Salvar</button>
                    </form>

                </div>

                <div className="container">
                    <button className="logout-btn" onClick={()=> logout()}>Sair</button>
                </div>
            </div>
        </div>
    )
}