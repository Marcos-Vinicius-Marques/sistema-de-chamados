import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext({}); // iniciando o contexto (context) com objeto vazio

function AuthProvider({ children }){
  const [user, setUser] = useState(null); // Dados do usuário
  const [loadingAuth, setLoadingAuth] = useState(false); // Botão do "Carregando" ao fazer requisições
  const [loading, setLoading] = useState(true);  // 

  const navigate = useNavigate();

  useEffect(()=> {
    async function loadUser(){
      const storageUser = localStorage.getItem("@ticketsPRO"); // pegando os dados do "@ticketsPRO" no localstorage

      if(storageUser){
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }
      setLoading(false);
    }
    loadUser(); 
  }, [])

  // acessar com o usuário
  async function signIn(email, password){
    setLoadingAuth(true);

    await signInWithEmailAndPassword(auth, email, password)
    .then(async (value)=> {
      let uid = value.user.uid;

      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      let data = {
        uid: uid,
        nome: docSnap.data().nome,
        email: value.user.email,
        avatarUrl: docSnap.data().avatarUrl
      };

      setUser(data);
      storageUser(data);
      setLoadingAuth(false);
      toast.success("Bem-vindo(a) de volta!");
      navigate("/dashboard");
    })
    .catch((error)=> {
      console.log(error);
      setLoadingAuth(false);
      toast.error("Ops algo deu errado!");
    })
  }

  // cadastrar usuário
  async function signUp(email, password, name){
    setLoadingAuth(true);

    await createUserWithEmailAndPassword(auth, email, password)
    .then(async (value)=>{
      let uid = value.user.uid;

      await setDoc(doc(db, 'users', uid), {
        nome: name,
        avatarUrl: null,
      })
      .then(()=> {
        // objeto com as informações do usuário para armazenar no auth
        let data = {
          uid: uid,
          nome: name,
          email: value.user.email,
          avatarUrl: null
        };    
        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success("Seja bem-vindo ao sistema");
        navigate('/dashboard');
      })
    })
    .catch((error)=> {
      console.log(error);
      setLoadingAuth(false);
    })
  }

  function storageUser(data){
    localStorage.setItem('@ticketsPRO', JSON.stringify(data)); // atualizar e pegar os dados do usuário no local storage
  }

  async function logout(){
    await signOut(auth);
    localStorage.removeItem('@ticketsPRO');
    setUser(null);
  }

  return(
    <AuthContext.Provider 
      value={{
        signed: !!user, // !! vai converter a variavel user para booleano enquanto não tiver nenhum valor
                        // e serve para verificar se tem algum usuário logado
        user, // informações do usuário
        signIn, // acessar com o usuário
        signUp, // cadastrar usuário
        logout, // deslogar usuário
        loadingAuth, // botão condicional do "Carregando"
        loading,
        storageUser, // atualizar e pegar os dados do usuário no local storage
        setUser // função para alterar o nome do usuário na página de Perfil
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider;