<div align="center">

<img src="https://img.shields.io/badge/Copa%20do%20Mundo-2026-006847?style=for-the-badge&logo=fifa&logoColor=white" />
<img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-red?style=for-the-badge" />
<img src="https://img.shields.io/badge/Versão-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/Licença-MIT-green?style=for-the-badge" />

### ⚽ Sua experiência. Sua Copa. Seu diário.

**Aplicação web para registro de experiências pessoais durante a Copa do Mundo 2026**

[📋 Documentação](#-documentação) • [🚀 Funcionalidades](#-funcionalidades) • [🛠️ Tecnologias](#%EF%B8%8F-tecnologias) • [▶️ Como Rodar](#%EF%B8%8F-como-rodar) • [👥 Equipe](#-equipe)

</div>

---

## Sobre o Projeto

O **Diário Digital da Copa 2026** é uma aplicação web desenvolvida como projeto acadêmico no **Instituto Federal**, no contexto da disciplina de **Análise de Projeto de Sistemas**. A plataforma combina acompanhamento informativo com interação pessoal, permitindo que torcedores construam um registro único e personalizado de suas vivências durante a Copa do Mundo de 2026.

> *"Não é só futebol. É memória."*

Cada jogo tem uma história e essa história merece ser contada por quem a viveu. O sistema funciona como um **diário digital interativo**, onde o usuário pode registrar opiniões, sentimentos, avaliações, imagens e localizações de onde assistiu a cada partida, tudo organizado em uma linha do tempo pessoal.

---

## Público-Alvo

| Perfil | Descrição |
|--------|-----------|
| **Torcedor Engajado** | Quer registrar emoções, avaliar jogos, comentar e acompanhar estatísticas da Copa com profundidade |
| **Usuário Casual** | Busca acessar rapidamente resultados e informações sem interações complexas |

---

## Funcionalidades

### Autenticação e Conta

| ID | Funcionalidade | Descrição |
|----|---------------|-----------|
| RF01 | **Criar Conta** | Cadastro com nome, e-mail e senha, com validação de formato e segurança |
| RF02 | **Alterar Senha** | Atualização segura da senha com validação da senha atual |
| RF03 | **Efetuar Login** | Autenticação por e-mail e senha com início de sessão |
| RF04 | **Efetuar Logout** | Encerramento seguro da sessão com invalidação de token |

### Experiências e Interações

| ID | Funcionalidade | Descrição |
|----|---------------|-----------|
| RF05 | **Registrar Experiência** | Publicação de texto no feed privado do usuário sobre um jogo |
| RF06 | **Adicionar Nota** | Avaliação numérica do jogo (escala de 0 a 5, com incremento de 0.5) |
| RF07 | **Marcar como Assistido** | Sinalização de partidas já vistas, com histórico de visualização |
| RF08 | **Adicionar Sentimento** | Registro emocional da partida (felicidade, frustração, entusiasmo etc.) |
| RF09 | **Adicionar Imagem** | Upload de imagens vinculadas à experiência registrada |
| RF10 | **Adicionar Comentário** | Texto livre associado a um jogo específico |
| RF11 | **Adicionar Localização** | Registro do local onde o jogo foi assistido (nome, endereço ou GPS) |

### Consultas e Organização

| ID | Funcionalidade | Descrição |
|----|---------------|-----------|
| RF12 | **Consultar Linha do Tempo** | Feed cronológico privado com filtros por data, seleção e jogo |
| RF14 | **Criar Lista de Jogos** | Organização personalizada de partidas em listas nomeadas |
| RF15 | **Adicionar Favorito** | Marcação de jogos favoritos com acesso rápido em aba dedicada |

---

## Requisitos Não Funcionais

```
┌─────────────────────────────────────────────────────────────┐
│                    ATRIBUTOS DE QUALIDADE                   │
├──────────────────┬──────────────────────────────────────────┤
│    Usabilidade   │ Interface intuitiva, sem necessidade de  │
│                  │ treinamento prévio                       │
├──────────────────┼──────────────────────────────────────────┤
│    Desempenho    │ Operações principais em até 3 segundos   │
├──────────────────┼──────────────────────────────────────────┤
│    Segurança     │ Senhas criptografadas, acesso autenticado│
├──────────────────┼──────────────────────────────────────────┤
│   Disponibilidade│ Uptime contínuo, especialmente durante   │
│                  │ o período da Copa                        │
├──────────────────┼──────────────────────────────────────────┤
│   Compatibilidade│ Chrome, Edge e navegadores modernos      │
├──────────────────┼──────────────────────────────────────────┤
│   Integridade    │ Dados corretos, sem duplicidade ou       │
│                  │ inconsistências                          │
├──────────────────┼──────────────────────────────────────────┤
│  Confiabilidade  │ Baixa taxa de falhas, erros comunicados  │
│                  │ claramente ao usuário                    │
├──────────────────┼──────────────────────────────────────────┤
│  Manutenibilidade│ Código estruturado seguindo boas práticas│
└──────────────────┴──────────────────────────────────────────┘
```

---

## Tecnologias

> ⚠️ *Esta seção será atualizada posteriormente*

```bash
# Frontend
[ a definir ]

# Backend
[ a definir ]

# Banco de Dados
[ a definir ]

# Autenticação
[ a definir ]

# API externa (dados da Copa)
[ a definir ]
```

---

## Estrutura do Projeto

> ⚠️ *A estrutura de pastas será detalhada ao longo do desenvolvimento.*

```
diario-digital-copa-2026/
│
├── 📁 docs/                    # Documentação do projeto
│   ├── requisitos.pdf          # Documento de requisitos (este arquivo)
│   └── diagramas/              # Diagramas UML e de fluxo
│
├── 📁 frontend/                # Código da interface do usuário
│
├── 📁 backend/                 # API e lógica de negócio
│
├── 📁 database/                # Scripts e migrações do banco de dados
│
├── 📄 .env.example             # Variáveis de ambiente (exemplo)
├── 📄 .gitignore
└── 📄 README.md
```

---

## Como Rodar

> ⚠️ *As instruções completas de instalação e execução serão adicionadas ao longo do desenvolvimento.*

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/diario-digital-copa-2026.git

# 2. Acesse a pasta do projeto
cd diario-digital-copa-2026

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Siga as instruções específicas de cada módulo (frontend/backend)
```
---

## Documentação

| Documento | Descrição | Status |
|-----------|-----------|--------|
| Documento de Requisitos | Requisitos funcionais (RF01–RF15) e não funcionais (RNF01–RNF08) | ✅ Concluído |
| Diagramas UML | Casos de uso, classes, sequência, estados e atividades | ✅ Concluído |
| Protótipos | Wireframes e mockups das telas | 🔄 Em andamento |

---

---

## Equipe

<table>
  <tr>
    <td align="center"><b>Ana Carla Vidal</b></td>
    <td align="center"><b>Gabriel Dourado</b></td>
    <td align="center"><b>José Guilherme</b></td>
    <td align="center"><b>Iarley Freitas</b></td>
    <td align="center"><b>Letícia Sousa</b></td>
  </tr>
</table>

**Bacharelado em Ciências da Computação**

---

## Progresso do Projeto

- [x] Documento de Requisitos Funcionais e Não Funcionais
- [x] Diagramas UML (Casos de Uso, Classes, Sequência)
- [ ] Protótipos / Wireframes
- [ ] Configuração do ambiente de desenvolvimento
- [ ] Implementação do módulo de autenticação (RF01–RF04)
- [ ] Implementação das funcionalidades de experiência (RF05–RF11)
- [ ] Implementação das funcionalidades de consulta (RF12–RF15)
- [ ] Testes e validação
- [ ] Deploy

---

## Licença

Este projeto é desenvolvido para fins acadêmicos no **IFCE - Campus Aracati**.  
Distribuído sob a licença **MIT**. Veja `LICENSE` para mais informações.

---

<div align="center">

</div>
