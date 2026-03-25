# SETUP — AL Desenvolvimento Web + Firebase

## 1. Criar projeto no Firebase

1. Acesse https://console.firebase.google.com
2. Clique em "Adicionar projeto"
3. Dê um nome (ex: al-desenvolvimento-web)
4. Desative o Google Analytics (opcional)
5. Clique em "Criar projeto"

---

## 2. Adicionar app Web

1. Na tela inicial do projeto, clique no ícone Web ( </> )
2. Dê um apelido (ex: site-al)
3. Clique em "Registrar app"
4. Copie o objeto `firebaseConfig` e cole no arquivo `firebase-config.js`
5. Clique em "Continuar"

---

## 3. Ativar Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Selecione "Iniciar no modo de produção"
4. Escolha a região (recomendado: southamerica-east1 para o Brasil)
5. Clique em "Ativar"

### Regras do Firestore (cole na aba "Regras"):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /portfolio/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /testimonials/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 4. Ativar Firebase Storage

1. No menu lateral, clique em "Storage"
2. Clique em "Começar"
3. Aceite as regras padrão
4. Escolha a mesma região do Firestore
5. Clique em "Concluído"

### Regras do Storage (cole na aba "Regras"):

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 5. Criar usuário admin (autenticação)

1. No menu lateral, clique em "Authentication"
2. Clique em "Começar"
3. Ative o provedor "E-mail/senha"
4. Vá na aba "Usuários"
5. Clique em "Adicionar usuário"
6. Informe seu e-mail e uma senha forte (mínimo 8 caracteres)
7. Clique em "Adicionar usuário"

Esse e-mail e senha são usados para entrar no painel admin.

---

## 6. Configurar HTTPS (obrigatório para segurança)

Use um desses serviços gratuitos para hospedar com HTTPS:
- Firebase Hosting: `firebase deploy` (recomendado)
- Netlify: arraste a pasta do projeto
- Vercel: conecte seu repositório GitHub

Nunca use o site em `http://` com dados reais. Sempre `https://`.

---

## 7. Estrutura de arquivos

```
/
  index.html
  admin.html
  style.css
  script.js
  firebase-config.js
  SETUP.md
```

Todos os arquivos precisam estar na mesma pasta para funcionar.

---

## Dúvidas frequentes

**Os dados somem quando atualizo a página?**
Não. Tudo fica salvo no Firestore (nuvem Firebase). O localStorage era temporário; agora é permanente.

**Posso usar no celular?**
Sim. O admin também é mobile-friendly.

**Alguém pode hackear?**
Com as regras acima, apenas usuários autenticados podem escrever dados. Leitura é pública (necessário para o site funcionar). Ninguém consegue deletar ou alterar seus dados sem login.

**O Firebase é pago?**
O plano Spark (gratuito) suporta até 1GB de Firestore, 5GB de Storage e 10GB de transferência por mês. Para um portfólio, é mais que suficiente.
