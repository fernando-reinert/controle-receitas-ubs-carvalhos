﻿# 💊 Sistema de Controle de Receitas Médicas - UBS Carvalhos

Sistema de controle de receitas médicas desenvolvido para a UBS de Carvalhos. Esta aplicação substitui o antigo controle feito manualmente em cadernos, permitindo cadastrar pacientes, controlar prazos de validade das receitas e impedir renovações fora do prazo.

---

## 🧩 Problema real resolvido

Antes, o controle de receitas era feito em papel. Pacientes pegavam remédios antes do vencimento da receita médica, o que gerava confusão e falhas no controle da farmácia. Agora, com este sistema:

- Cada paciente é cadastrado.
- Cada receita é registrada com data e validade (ex: 30 dias).
- O sistema informa se a receita ainda está válida ao tentar renovar.
- Evita renovações fora do prazo.

---

## 🚀 Tecnologias utilizadas

- [Vite](https://vitejs.dev/) (Frontend)
- [Electron](https://www.electronjs.org/) (Aplicativo Desktop)
- [Supabase](https://supabase.com/) (Banco de dados e autenticação)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📦 Funcionalidades principais

- Cadastro de pacientes
- Registro de medicamentos por receita
- Controle automático de validade da receita
- Bloqueio de renovações fora do prazo
- Histórico por paciente
- Interface simples para uso local

---

## ⚙️ Como rodar o projeto localmente

### Pré-requisitos
- Node.js
- npm ou yarn
- Git

### Instalação

```bash
git clone [https://github.com/fernando-reinert/seu-repo](https://github.com/fernando-reinert/controle-receitas-ubs-carvalhos/tree/main.git
cd controle-receitas
npm install
npm run dev
