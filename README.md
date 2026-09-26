# VØIDCORE V2 Preview

Estrutura inicial da V2 do VØIDCORE.

- `index.html` — hub principal
- `cs2.html` — CS2 CORE
- `valorant.html` — VALORANT CORE
- `r6.html` — R6 CORE
- `lab.html` — VØID LAB
- `style.css` — visual compartilhado
- `app.js` — cálculos e componentes

## Matemática de sensibilidade
O projeto não compara o número bruto de sensibilidade entre jogos. Ele converte para cm/360° e volta para a escala do jogo de destino.

Constantes usadas nesta preview:
- CS2: yaw padrão `0.022`
- VALORANT: yaw `0.07`
- R6 hipfire: `MouseSensitivityMultiplierUnit` padrão `0.02` (configurável na página R6)

R6 ADS/scopes fica separado porque exige tratamento específico e não deve ser apresentado como uma conversão hipfire simples.
