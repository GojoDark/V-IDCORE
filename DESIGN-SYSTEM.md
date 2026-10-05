# Design system V4

Core Signal contribui com clareza, espaçamento e wordmark sóbrio. Void Axis contribui com o símbolo angular. A construção é original, sem reutilização de imagens conceituais.

## Tokens

| Papel | Valor |
|---|---|
| Fundo | `#0b0c10` |
| Superfície | `#111218` |
| Controle / superfície elevada | `#181920` |
| Linha | `#272831` |
| Texto principal | `#f1f1f5` |
| Texto secundário | `#9b9ba9` |
| Acento | `#a393ff` |
| Fundo de seleção | `#242033` |
| Sucesso | `#8bd6b0` |
| Erro | `#ff9caa` |

Tipografia: Inter quando disponível, Segoe UI/Arial como fallback local; Cascadia Code/Consolas para valores, códigos e metadados. Nenhuma fonte remota obrigatória. Títulos 40 px desktop / 32 px mobile; corpo 14 px; campos 12 px; metadados 10–11 px. Escala de espaçamento: 4, 8, 12, 16, 24, 32, 48, 64 px. Raio 12 px para painéis e 6–7 px para controles.

## Componentes

- Navegação: rail lateral com seleção violeta discreta; menu recolhível em mobile. Escape fecha o menu.
- Abas: links reais com parâmetros de módulo, underline ativo e `aria-current`.
- Preview: painel dominante, cena própria, mira centrada e nota de fidelidade. Estados parado/movimento/disparo com `aria-pressed`.
- Controles: rótulo conectado ao input; saída numérica ligada ao range; opções condicionais por geometria; advanced com `details/summary` nativo.
- Sliders: acento único, valor legível, operação por teclado nativa, limites explícitos.
- Inputs: superfície escura, borda única, foco visível. Erro marca `aria-invalid` e bloqueia geração/cópia quando necessário.
- Botões: preenchido violeta somente para ação principal; neutros e ghost para auxiliares. Desabilitado tem menor opacidade e sem ação.
- Cards: restritos a agrupamentos funcionais; a Home usa linhas, não uma grade de cards redundantes.
- Tooltips: texto curto associado ao campo, acessível por foco e hover.
- Avisos: linha violeta e texto secundário. Sem alarmes sobre riscos hipotéticos.
- Feedback: mensagens locais de importação e toast com `role=status`; sem diálogos para ações reversíveis.
- Biblioteca e histórico: conteúdo criado com `textContent`, evitando interpretação de HTML de presets.

## Responsividade e acessibilidade

Preview acima dos controles abaixo de 900 px. Sidebar vira menu abaixo de 650 px. Layout testado de 320 a 1440 px, com verificação de ausência de overflow horizontal. Uso de landmarks, link de pular conteúdo, foco visível, labels, componentes nativos, estados anunciados e respeito a `prefers-reduced-motion`.

## Marca

`assets/symbol.svg`: símbolo separado e favicon, viewBox 64 × 64. `assets/wordmark.svg`: marca horizontal em vetor com texto editável e fontes comuns. Use a versão HTML do header quando desejar herdar a tipografia da aplicação. O símbolo tem uma abertura central e eixo superior independente; preserve a proporção e não aplique gradiente no wordmark.
